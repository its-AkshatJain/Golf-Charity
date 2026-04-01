"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addScore(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const score = parseInt(formData.get("score") as string, 10);
  const dateStr = formData.get("date") as string;

  if (isNaN(score) || score < 1 || score > 45 || !dateStr) {
    return { error: "Invalid score or date." };
  }

  const { error } = await supabase
    .from("scores")
    .insert({
      user_id: user.id,
      score: score,
      date: new Date(dateStr).toISOString(),
    });

  if (error) {
    console.error("Error inserting score:", error);
    return { error: "Could not save score." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
