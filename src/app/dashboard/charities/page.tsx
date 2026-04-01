import { createClient } from "@/utils/supabase/server";
import CharitiesClient from "./CharitiesClient";

export default async function CharitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, charitiesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("selected_charity_id, charity_contribution_percentage")
      .eq("id", user.id)
      .single(),
    supabase
      .from("charities")
      .select("*")
      .order("featured", { ascending: false }),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Impact</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          Charity Directory
        </h1>
        <p className="text-gray-500 mt-1 text-sm max-w-lg">
          Choose a cause and set your contribution percentage. A minimum of 10%
          of your winnings goes to charity — you can increase this anytime.
        </p>
      </div>

      <CharitiesClient
        charities={charitiesRes.data || []}
        selectedCharityId={profileRes.data?.selected_charity_id ?? null}
        contributionPct={profileRes.data?.charity_contribution_percentage ?? 10}
      />
    </div>
  );
}
