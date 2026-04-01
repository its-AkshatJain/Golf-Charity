"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitWinnerProof(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not logged in" };
  }

  const entryId = formData.get("entry_id") as string;
  const proofUrl = formData.get("proof") as string; // in a real app this would be a file upload

  if (!entryId || !proofUrl) {
    return { error: "Missing proof" };
  }

  const { error } = await supabase
    .from("draw_entries")
    .update({ status: 'pending' }) // could add a column for proof_url
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Failed to submit proof." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
