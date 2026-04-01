"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCharities() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("charities").select("*").order("featured", { ascending: false });
  if (error) {
    console.error("Error fetching charities:", error);
    return [];
  }
  return data;
}

export async function saveOnboardingPreferences(
  charityId: string,
  percentage: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      selected_charity_id: charityId,
      charity_contribution_percentage: percentage,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to save preferences" };
  }

  return { success: true };
}
