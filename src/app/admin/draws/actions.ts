"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyWinner(entryId: string, newStatus: 'verified' | 'rejected') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("draw_entries")
    .update({ status: newStatus })
    .eq("id", entryId);

  if (error) {
    console.error("Failed to verify:", error);
    throw new Error("Failed to update status");
  }

  revalidatePath("/admin/draws");
}
