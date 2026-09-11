require("dotenv").config();
const { Pool } = require("pg");

const missingDatabaseUrlError = () =>
  new Error(
    "DATABASE_URL is required. Configure PostgreSQL before using database-backed endpoints.",
  );

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    })
  : {
      query: async () => {
        throw missingDatabaseUrlError();
      },
      connect: async () => {
        throw missingDatabaseUrlError();
      },
      end: async () => {},
    };

async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
