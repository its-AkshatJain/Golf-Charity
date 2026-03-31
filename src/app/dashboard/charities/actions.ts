"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function selectCharity(charityId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ selected_charity_id: charityId })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to select charity:", error);
    return { error: "Failed to update profile." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/charities");
}

export async function updateContribution(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const percentage = parseInt(formData.get("percentage") as string, 10);
  if (isNaN(percentage) || percentage < 10 || percentage > 100) {
     return { error: "Invalid percentage. Minimum is 10%." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ charity_contribution_percentage: percentage })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to update percentage." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/charities");
}
