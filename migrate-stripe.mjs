import pkg from 'pg';
const { Client } = pkg;

async function runSQL() {
  const client = new Client({
    connectionString: "postgresql://postgres:l7f6tEb3cAVbarUE@db.xumtxjqrggwavfgwmtrs.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;");
    console.log("Stripe customer ID column added.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}
runSQL();
