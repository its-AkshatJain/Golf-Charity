import pg from "pg";
const { Client } = pg;
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("No DATABASE_URL found.");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
});

async function run() {
  await client.connect();
  console.log("Connected to DB.");

  try {
    await client.query("BEGIN;");

    // Add category and location to charities if they don't exist
    await client.query(`
      ALTER TABLE public.charities 
      ADD COLUMN IF NOT EXISTS category text,
      ADD COLUMN IF NOT EXISTS location text;
    `);
    console.log("Updated charities table.");

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        charity_id uuid REFERENCES public.charities(id) ON DELETE CASCADE,
        title text NOT NULL,
        date timestamp with time zone NOT NULL,
        description text,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    
    // Also enable RLS for events and add a public read policy
    await client.query(`
      ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    `);

    // We must check if policy exists to avoid errors, or just drop and recreate
    await client.query(`
      DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
      CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
    `);

    console.log("Created events table and policies.");

    await client.query(`
      ALTER TABLE public.draws DROP CONSTRAINT IF EXISTS draws_status_check;
      UPDATE public.draws SET status = 'published' WHERE status NOT IN ('draft', 'published', 'simulated');
      ALTER TABLE public.draws ADD CONSTRAINT draws_status_check CHECK (status IN ('draft', 'published', 'simulated'));
      ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS jackpot_rollover NUMERIC DEFAULT 0;
    `);
    console.log("Updated draws table with status check and jackpot_rollover.");

    await client.query("COMMIT;");
    console.log("Migration successful.");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error running migration:", err);
  } finally {
    await client.end();
  }
}

run();
