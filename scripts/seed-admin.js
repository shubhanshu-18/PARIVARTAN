require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool, testConnection } = require("../database");
const db = require("../db");

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) before running db:admin",
    );
  }

  await testConnection();
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await db.createAdmin({ email, passwordHash });
  console.log(`Admin account ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
