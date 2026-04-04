export type Transfer = {
  id: string;
  createdAt: string;
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  recipient: string;
  bridge: string;
  bridgeName: string;
  fee: string;
  receiveAmount: string;
  txHash?: string;
  status: "pending" | "processing" | "complete" | "failed";
};

type TransferUpdate = Partial<Omit<Transfer, "id" | "createdAt">>;

// ─── In-memory store ────────────────────────────────────────────────────────

const memStore = new Map<string, Transfer>();

function memCreate(data: Omit<Transfer, "id" | "createdAt">): Transfer {
  const transfer: Transfer = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  memStore.set(transfer.id, transfer);
  return transfer;
}

function memGet(id: string): Transfer | null {
  return memStore.get(id) ?? null;
}

function memUpdate(id: string, data: TransferUpdate): Transfer | null {
  const existing = memStore.get(id);
  if (!existing) return null;
  const updated: Transfer = { ...existing, ...data };
  memStore.set(id, updated);
  return updated;
}

function memList(limit = 50): Transfer[] {
  return [...memStore.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

// ─── Postgres store ──────────────────────────────────────────────────────────

let pgPool: import("pg").Pool | null = null;
let pgReady = false;

async function getPool(): Promise<import("pg").Pool> {
  if (pgPool) return pgPool;

  const { Pool } = await import("pg");
  pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

  if (!pgReady) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id          TEXT PRIMARY KEY,
        created_at  TEXT NOT NULL,
        from_chain  TEXT NOT NULL,
        to_chain    TEXT NOT NULL,
        token       TEXT NOT NULL,
        amount      TEXT NOT NULL,
        recipient   TEXT NOT NULL,
        bridge      TEXT NOT NULL,
        bridge_name TEXT NOT NULL,
        fee         TEXT NOT NULL,
        receive_amount TEXT NOT NULL,
        tx_hash     TEXT,
        status      TEXT NOT NULL DEFAULT 'pending'
      )
    `);
    pgReady = true;
  }

  return pgPool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTransfer(row: any): Transfer {
  return {
    id: row.id,
    createdAt: row.created_at,
    fromChain: row.from_chain,
    toChain: row.to_chain,
    token: row.token,
    amount: row.amount,
    recipient: row.recipient,
    bridge: row.bridge,
    bridgeName: row.bridge_name,
    fee: row.fee,
    receiveAmount: row.receive_amount,
    txHash: row.tx_hash ?? undefined,
    status: row.status,
  };
}

async function pgCreate(data: Omit<Transfer, "id" | "createdAt">): Promise<Transfer> {
  const pool = await getPool();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await pool.query(
    `INSERT INTO transfers
      (id, created_at, from_chain, to_chain, token, amount, recipient, bridge, bridge_name, fee, receive_amount, tx_hash, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      id,
      createdAt,
      data.fromChain,
      data.toChain,
      data.token,
      data.amount,
      data.recipient,
      data.bridge,
      data.bridgeName,
      data.fee,
      data.receiveAmount,
      data.txHash ?? null,
      data.status,
    ]
  );

  return { id, createdAt, ...data };
}

async function pgGet(id: string): Promise<Transfer | null> {
  const pool = await getPool();
  const { rows } = await pool.query("SELECT * FROM transfers WHERE id = $1", [id]);
  return rows.length ? rowToTransfer(rows[0]) : null;
}

async function pgUpdate(id: string, data: TransferUpdate): Promise<Transfer | null> {
  const pool = await getPool();
  const fields = Object.entries({
    from_chain: data.fromChain,
    to_chain: data.toChain,
    token: data.token,
    amount: data.amount,
    recipient: data.recipient,
    bridge: data.bridge,
    bridge_name: data.bridgeName,
    fee: data.fee,
    receive_amount: data.receiveAmount,
    tx_hash: data.txHash,
    status: data.status,
  }).filter(([, v]) => v !== undefined);

  if (fields.length === 0) return pgGet(id);

  const setClause = fields.map(([col], i) => `${col} = $${i + 2}`).join(", ");
  const values = [id, ...fields.map(([, v]) => v)];

  const { rows } = await pool.query(
    `UPDATE transfers SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return rows.length ? rowToTransfer(rows[0]) : null;
}

async function pgList(limit = 50): Promise<Transfer[]> {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM transfers ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return rows.map(rowToTransfer);
}

// ─── Public interface ────────────────────────────────────────────────────────

const usePostgres = !!process.env.DATABASE_URL;

export async function createTransfer(
  data: Omit<Transfer, "id" | "createdAt">
): Promise<Transfer> {
  return usePostgres ? pgCreate(data) : Promise.resolve(memCreate(data));
}

export async function getTransfer(id: string): Promise<Transfer | null> {
  return usePostgres ? pgGet(id) : Promise.resolve(memGet(id));
}

export async function updateTransfer(
  id: string,
  data: TransferUpdate
): Promise<Transfer | null> {
  return usePostgres ? pgUpdate(id, data) : Promise.resolve(memUpdate(id, data));
}

export async function listTransfers(limit = 50): Promise<Transfer[]> {
  return usePostgres ? pgList(limit) : Promise.resolve(memList(limit));
}
