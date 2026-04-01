import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// This uses the Service Role Key to bypass Row Level Security rules
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  // NOTE: If using Anon Key, this will fail. You must add SUPABASE_SERVICE_ROLE_KEY to .env.local
);

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address. \nUsage: node scripts/set-admin.mjs <user@email.com>");
  process.exit(1);
}

async function setAdmin() {
  console.log(`Looking up user by email: ${email}...`);
  // Note: auth.users is hidden from standard API. We can update profiles directly using the email if we do a join,
  // but Supabase JS doesn't support joining auth to public easily from the client.
  // Instead, we can use the Admin API to get the user.
  
  const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (userError || !users) {
    console.error("Could not fetch users. Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local.", userError);
    process.exit(1);
  }

  const targetUser = users.find(u => u.email === email);

  if (!targetUser) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`Setting role to 'admin' for user ID: ${targetUser.id}`);

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", targetUser.id);

  if (profileError) {
    console.error("Failed to update profile:", profileError);
    process.exit(1);
  }

  console.log(`Success! User ${email} is now an Admin.`);
}

setAdmin();
