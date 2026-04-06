"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addScore(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin" && sub?.status !== "active") {
    return { error: "Only active subscribers can record scores. Please renew your plan." };
  }

  const score = parseInt(formData.get("score") as string, 10);
  const dateStr = formData.get("date") as string;

  if (isNaN(score) || score < 1 || score > 45) {
    return { error: "Score must be between 1 and 45 (Stableford format)." };
  }
  if (!dateStr) {
    return { error: "Please select a round date." };
  }

  const parsedDate = new Date(dateStr).toISOString();

  // Check if date is in the future
  if (new Date(parsedDate) > new Date()) {
    return { error: "You cannot enter a score for a future date." };
  }

  // Check if a score for this date already exists for the user
  const { data: existingScore } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", parsedDate)
    .maybeSingle();

  if (existingScore) {
    return { error: "You already have a score recorded for this date. Please edit your existing score instead." };
  }

  // Insert the new score — the DB trigger will FIFO-delete the oldest if >5 exist
  const { error } = await supabase
    .from("scores")
    .insert({
      user_id: user.id,
      score,
      date: parsedDate,
    });

  if (error) {
    return { error: "Could not save your score. Please try again." };
  }

  revalidatePath("/dashboard/scores");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteScore(scoreId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { data: sub } = await supabase.from("subscriptions").select("status").eq("user_id", user.id).single();

  if (profile?.role !== "admin" && sub?.status !== "active") {
    return { error: "Only active subscribers can delete scores." };
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("scores")
    .delete()
    .eq("id", scoreId)
    .eq("user_id", user.id); // Ownership check still maintained

  if (error) {
    return { error: "Could not delete score." };
  }

  revalidatePath("/dashboard/scores");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateScore(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scoreId = formData.get("scoreId") as string;
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { data: sub } = await supabase.from("subscriptions").select("status").eq("user_id", user.id).single();

  if (profile?.role !== "admin" && sub?.status !== "active") {
    return { error: "Only active subscribers can update scores. Please renew your plan." };
  }
  const score = parseInt(formData.get("score") as string, 10);
  const dateStr = formData.get("date") as string;

  if (!scoreId) return { error: "Invalid score ID." };
  if (isNaN(score) || score < 1 || score > 45) {
    return { error: "Score must be between 1 and 45." };
  }
  if (!dateStr) return { error: "Please select a date." };

  // Check if changing to a date that already has a score
  const parsedDate = new Date(dateStr).toISOString();

  if (new Date(parsedDate) > new Date()) {
    return { error: "You cannot update a score to a future date." };
  }

  const { data: existingScore } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", parsedDate)
    .maybeSingle();

  if (existingScore && existingScore.id !== scoreId) {
    return { error: "You already have a score recorded for this newly selected date." };
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("scores")
    .update({ score, date: parsedDate })
    .eq("id", scoreId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Could not update score." };
  }

  revalidatePath("/dashboard/scores");
  revalidatePath("/dashboard");
  return { success: true };
}
