import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const charities = [
  {
    name: "UNICEF Emergency Relief",
    description:
      "UNICEF works in over 190 countries to reach the most disadvantaged children and adolescents. Emergency relief funds provide food, clean water, healthcare, and education to children in crisis zones worldwide.",
    image_url: null,
    featured: true,
  },
  {
    name: "Save the Children",
    description:
      "Save the Children fights for children's rights, delivering immediate and lasting improvements to their lives globally. Donations fund health programs, education, and child protection in the most vulnerable communities.",
    image_url: null,
    featured: true,
  },
  {
    name: "WaterAid",
    description:
      "WaterAid transforms lives by improving access to safe water, sanitation and hygiene in the world's poorest communities. Clean water is the foundation of health, dignity and opportunity.",
    image_url: null,
    featured: false,
  },
  {
    name: "Médecins Sans Frontières (MSF)",
    description:
      "Doctors Without Borders provides independent, impartial medical humanitarian assistance to people caught in crises. MSF treats those who need it most, regardless of race, religion, or politics.",
    image_url: null,
    featured: false,
  },
  {
    name: "Against Malaria Foundation",
    description:
      "The Against Malaria Foundation funds long-lasting insecticidal nets to protect families from malaria in Sub-Saharan Africa. It is consistently rated one of the most cost-effective charities in the world.",
    image_url: null,
    featured: false,
  },
  {
    name: "Room to Read",
    description:
      "Room to Read transforms children's lives through literacy and gender equality in education. Active in low-income communities across Asia and Africa, they build libraries, train teachers, and support girls to complete school.",
    image_url: null,
    featured: false,
  },
];

async function seed() {
  console.log("🌱 Seeding charities...");

  // Check if any already exist
  const { data: existing } = await supabase.from("charities").select("name");
  const existingNames = new Set((existing || []).map((c) => c.name));

  const toInsert = charities.filter((c) => !existingNames.has(c.name));

  if (toInsert.length === 0) {
    console.log("✅ All charities already exist. Nothing to seed.");
    return;
  }

  const { data, error } = await supabase.from("charities").insert(toInsert).select();

  if (error) {
    console.error("❌ Error seeding charities:", error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${data.length} charities:`);
  data.forEach((c) => console.log(`   • ${c.name}`));
}

seed();
