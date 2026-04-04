#!/usr/bin/env -S ts-node
/*
  Test script for updateBalance in lib/db.ts

  Usage:
    - Ensure your Postgres connection env vars are set:
        PGHOST, PGPORT (optional), PGUSER, PGPASSWORD, PGDATABASE (optional)
    - From the swoin package root run:
        npx ts-node scripts/test-update-balance.ts

  The script will:
    1. Create a user with a random email (using createUser)
    2. Query session data (getUserSessionData) and print the balance
    3. Apply a delta via updateBalance
    4. Query session data again and print the updated balance

  Note: This performs real writes to your database. Run on a test DB.
*/

import { createUser, getUserSessionData, updateBalance } from "../lib/db";

function randomEmail() {
  return `test+${Math.random().toString(36).slice(2, 9)}@example.invalid`;
}

async function main() {
  const email = randomEmail();
  const passwordHash = "testpasswordhash"; // not used for real auth here

  console.log("Creating user with email:", email);
  const user = await createUser(email, passwordHash);
  console.log("Created user:", user);

  const before = await getUserSessionData(user.id);
  console.log("Session data before update:", before);

  const delta = 500;
  console.log(`Applying delta ${delta} to user id ${user.id}`);
  const newBalance = await updateBalance(user.id, delta);
  console.log("updateBalance returned:", newBalance);

  const after = await getUserSessionData(user.id);
  console.log("Session data after update:", after);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
