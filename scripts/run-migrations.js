#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const { Client } = require("pg")

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let val = trimmed.slice(eq + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const migrationsDir = path.join(__dirname, "..", "supabase", "migrations")
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("DATABASE_URL not set in .env")
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log("Connected to Supabase PostgreSQL\n")

  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  for (const file of files) {
    const { rows } = await client.query(
      "SELECT 1 FROM _migrations WHERE filename = $1",
      [file]
    )
    if (rows.length) {
      console.log(`⏭  Skip (already applied): ${file}`)
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")
    console.log(`▶  Running: ${file}`)
    try {
      await client.query("BEGIN")
      await client.query(sql)
      await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [file])
      await client.query("COMMIT")
      console.log(`✅ Done: ${file}\n`)
    } catch (err) {
      await client.query("ROLLBACK")
      console.error(`❌ Failed: ${file}`)
      console.error(err.message)
      process.exit(1)
    }
  }

  await client.end()
  console.log("All migrations completed successfully.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
