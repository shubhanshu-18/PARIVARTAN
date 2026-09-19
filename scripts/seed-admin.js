require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool, testConnection } = require("../database");

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Gram Sarthi Administrator").trim();

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to create an admin.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }

  await testConnection();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login TIMESTAMPTZ
    )
  `);

  const existing = await pool.query("SELECT id FROM admin_users WHERE email = $1", [email]);
  if (existing.rowCount > 0) {
    console.log(`Admin ${email} already exists. No duplicate was created.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    "INSERT INTO admin_users (name, email, password_hash) VALUES ($1, $2, $3)",
    [name, email, passwordHash],
  );
  console.log(`Admin ${email} created successfully.`);
}

main()
  .catch((error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());