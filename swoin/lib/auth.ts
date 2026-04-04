import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function validateCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { valid: false as const, message: "Email and password are required" };
  }

  if (normalizedEmail.length > 150) {
    return { valid: false as const, message: "Email is too long" };
  }

  if (password.length < 8 || password.length > 72) {
    return { valid: false as const, message: "Password must be 8-72 characters" };
  }

  return { valid: true as const, email: normalizedEmail, password };
}
