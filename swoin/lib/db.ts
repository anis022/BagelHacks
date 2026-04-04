import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (pool) return pool;

  const host = process.env.PGHOST;
  const port = Number(process.env.PGPORT ?? "5432");
  const user = process.env.PGUSER;
  const database = process.env.PGDATABASE ?? "swoin";
  const password = process.env.PGPASSWORD;
  const sslMode = process.env.PGSSLMODE ?? "prefer";

  if (!host) {
    throw new Error("PGHOST is not configured");
  }

  if (!password) {
    throw new Error("PGPASSWORD is not configured");
  }
  if (!user) {
    throw new Error("PGUSER is not configured");
  }

  pool = new Pool({
    host,
    port,
    user,
    database,
    password,
    ssl: sslMode === "disable" ? false : { rejectUnauthorized: sslMode === "verify-full" },
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  return pool;
}

export type AuthUser = {
  id: number;
  email: string;
  password: string;
};

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const result = await getPool().query<AuthUser>(
    "SELECT id, email, password FROM login WHERE email = $1 LIMIT 1",
    [email],
  );

  return result.rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string): Promise<{ id: number; email: string }> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const loginResult = await client.query<{ id: number; email: string }>(
      "INSERT INTO login (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash],
    );

    const user = loginResult.rows[0];
    await client.query("INSERT INTO balance (id, balance) VALUES ($1, $2)", [user.id, 0]);

    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getUserSessionData(userId: number): Promise<{ id: number; email: string; balance: string } | null> {
  const result = await getPool().query<{ id: number; email: string; balance: string }>(
    `SELECT l.id, l.email, COALESCE(b.balance, 0)::text AS balance
     FROM login l
     LEFT JOIN balance b ON b.id = l.id
     WHERE l.id = $1
     LIMIT 1`,
    [userId],
  );

  return result.rows[0] ?? null;
}
