import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

async function runMigrations() {
  const client = new Client({
    connectionString: "postgresql://postgres:l7f6tEb3cAVbarUE@db.xumtxjqrggwavfgwmtrs.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected successfully!");

    const schemaStr = fs.readFileSync('schema.sql', 'utf8');
    console.log("Running schema...");
    
    await client.query(schemaStr);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Error running migrations:", err);
  } finally {
    await client.end();
  }
}

runMigrations();
