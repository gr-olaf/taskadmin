const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({ path: envFile });

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "my-postgres",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "root",
  database: process.env.PGDATABASE || "taskadmin",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
      description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      position INT NOT NULL DEFAULT 0
    )
  `);
}

module.exports = pool;
module.exports.initDb = initDb;