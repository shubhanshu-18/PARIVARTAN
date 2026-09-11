const fs = require("fs/promises");
const path = require("path");
const { pool, testConnection } = require("../database");

async function main() {
  await testConnection();
  const schema = await fs.readFile(
    path.join(__dirname, "..", "database", "schema.sql"),
    "utf8",
  );
  await pool.query(schema);
  console.log("PostgreSQL connection verified and schema initialized.");
}

main()
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
