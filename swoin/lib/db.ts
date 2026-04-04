import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (pool) return pool;

  pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? "5432"),
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    ssl: false,
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

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<{ id: number; email: string }> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const loginResult = await client.query<{ id: number; email: string }>(
      "INSERT INTO login (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash],
    );
    const user = loginResult.rows[0];
    await client.query("INSERT INTO balance (id, balance) VALUES ($1, $2)", [user.id, 10000]);
    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getUserSessionData(
  userId: number,
): Promise<{ id: number; email: string; balance: string } | null> {
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

export async function searchUsers(
  query: string,
  excludeId?: number,
): Promise<{ id: number; email: string }[]> {
  const result = await getPool().query<{ id: number; email: string }>(
    "SELECT id, email FROM login WHERE id != $1 AND email ILIKE $2 LIMIT 10",
    [excludeId ?? -1, `%${query}%`],
  );
  return result.rows;
}

export async function getUserById(
  userId: number,
): Promise<{ id: number; email: string } | null> {
  const result = await getPool().query<{ id: number; email: string }>(
    "SELECT id, email FROM login WHERE id = $1 LIMIT 1",
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function transferBalance(
  fromId: number,
  toId: number,
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const fromResult = await client.query<{ balance: string }>(
      "SELECT balance::text FROM balance WHERE id = $1 FOR UPDATE",
      [fromId],
    );
    const toResult = await client.query<{ balance: string }>(
      "SELECT balance::text FROM balance WHERE id = $1 FOR UPDATE",
      [toId],
    );

    if (!fromResult.rows[0] || !toResult.rows[0]) {
      await client.query("ROLLBACK");
      return { success: false, error: "Account not found" };
    }

    const fromBalance = Number(fromResult.rows[0].balance);
    if (fromBalance < amount) {
      await client.query("ROLLBACK");
      return { success: false, error: "Insufficient balance" };
    }

    await client.query("UPDATE balance SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
    await client.query("UPDATE balance SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    await client.query(
      "INSERT INTO transactions (sender_id, receiver_id, amount) VALUES ($1, $2, $3)",
      [fromId, toId, amount],
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export type Transaction = {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_email: string;
  receiver_email: string;
  amount: string;
  created_at: string;
};

export async function getTransactions(userId: number): Promise<Transaction[]> {
  const result = await getPool().query<Transaction>(
    `SELECT t.id, t.sender_id, t.receiver_id,
            s.email AS sender_email, r.email AS receiver_email,
            t.amount::text, t.created_at::text
     FROM transactions t
     JOIN login s ON s.id = t.sender_id
     JOIN login r ON r.id = t.receiver_id
     WHERE t.sender_id = $1 OR t.receiver_id = $1
     ORDER BY t.created_at DESC
     LIMIT 20`,
    [userId],
  );
  return result.rows;
}

// --- Payment Methods ---

export type PaymentMethod = {
  id: number;
  user_id: number;
  type: string;
  label: string;
  details: string;
  created_at: string;
};

export async function getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
  const result = await getPool().query<PaymentMethod>(
    "SELECT id, user_id, type, label, details, created_at::text FROM payment_methods WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
}

export async function addPaymentMethod(
  userId: number,
  type: string,
  label: string,
  details: string,
): Promise<PaymentMethod> {
  const result = await getPool().query<PaymentMethod>(
    "INSERT INTO payment_methods (user_id, type, label, details) VALUES ($1, $2, $3, $4) RETURNING id, user_id, type, label, details, created_at::text",
    [userId, type, label, details],
  );
  return result.rows[0];
}

export async function deletePaymentMethod(userId: number, methodId: number): Promise<boolean> {
  const result = await getPool().query(
    "DELETE FROM payment_methods WHERE id = $1 AND user_id = $2",
    [methodId, userId],
  );
  return (result.rowCount ?? 0) > 0;
}

// --- Withdrawals ---

export type Withdrawal = {
  id: number;
  user_id: number;
  method_id: number;
  method_label: string;
  amount: string;
  created_at: string;
};

export async function createWithdrawal(
  userId: number,
  methodId: number,
  methodLabel: string,
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const balResult = await client.query<{ balance: string }>(
      "SELECT balance::text FROM balance WHERE id = $1 FOR UPDATE",
      [userId],
    );
    if (!balResult.rows[0]) {
      await client.query("ROLLBACK");
      return { success: false, error: "Account not found" };
    }
    if (Number(balResult.rows[0].balance) < amount) {
      await client.query("ROLLBACK");
      return { success: false, error: "Insufficient balance" };
    }

    await client.query("UPDATE balance SET balance = balance - $1 WHERE id = $2", [amount, userId]);
    await client.query(
      "INSERT INTO withdrawals (user_id, method_id, method_label, amount) VALUES ($1, $2, $3, $4)",
      [userId, methodId, methodLabel, amount],
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getWithdrawals(userId: number): Promise<Withdrawal[]> {
  const result = await getPool().query<Withdrawal>(
    "SELECT id, user_id, method_id, method_label, amount::text, created_at::text FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
    [userId],
  );
  return result.rows;
}

// --- Deposits ---

export type Deposit = {
  id: number;
  user_id: number;
  method_label: string;
  amount: string;
  crossmint_payment_id: string;
  created_at: string;
};

export async function createDeposit(
  userId: number,
  amount: number,
  methodLabel: string,
  crossmintPaymentId: string,
): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE balance SET balance = balance + $1 WHERE id = $2", [amount, userId]);
    await client.query(
      "INSERT INTO deposits (user_id, method_label, amount, crossmint_payment_id) VALUES ($1, $2, $3, $4)",
      [userId, methodLabel, amount, crossmintPaymentId],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getDeposits(userId: number): Promise<Deposit[]> {
  const result = await getPool().query<Deposit>(
    "SELECT id, user_id, method_label, amount::text, crossmint_payment_id, created_at::text FROM deposits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
    [userId],
  );
  return result.rows;
}
