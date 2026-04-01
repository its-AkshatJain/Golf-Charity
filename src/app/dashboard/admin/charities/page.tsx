import { createClient } from "@/utils/supabase/server";
import CharityCMSClient from "./CharityCMSClient";

export default async function AdminCharitiesPage() {
  const supabase = await createClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("featured", { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Admin · Charity CMS</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          Manage Charities
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Add, edit, or remove charities. Featured charities appear first in the
          directory and onboarding flow.
        </p>
      </div>

      <CharityCMSClient charities={charities || []} />
    </div>
  );
}
