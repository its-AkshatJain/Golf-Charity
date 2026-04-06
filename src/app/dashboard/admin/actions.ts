"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return { supabase, user };
}

// ─── CHARITY CMS ───────────────────────────────────────────────

export async function addCharity(prevState: any, formData: FormData) {
  const { supabase } = await assertAdmin();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const featured = formData.get("featured") === "on";

  if (!name) return { error: "Charity name is required." };

  const { error } = await supabase.from("charities").insert({
    name,
    description,
    image_url,
    featured,
  });

  if (error) return { error: "Failed to add charity: " + error.message };

  revalidatePath("/dashboard/admin/charities");
  revalidatePath("/dashboard/charities");
  revalidatePath("/onboarding");
  revalidatePath("/");
  return { success: true };
}

export async function updateCharity(prevState: any, formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const featured = formData.get("featured") === "on";

  if (!id || !name) return { error: "Invalid data." };

  const { error } = await supabase
    .from("charities")
    .update({ name, description, image_url, featured })
    .eq("id", id);

  if (error) return { error: "Failed to update charity: " + error.message };

  revalidatePath("/dashboard/admin/charities");
  revalidatePath("/dashboard/charities");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCharity(charityId: string) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase
    .from("charities")
    .delete()
    .eq("id", charityId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/charities");
  revalidatePath("/dashboard/charities");
  revalidatePath("/");
  return { success: true };
}

// ─── USER MANAGEMENT ───────────────────────────────────────────

export async function updateUserRole(formData: FormData) {
  await assertAdmin();
  const userId = formData.get("user_id") as string;
  const role = formData.get("role") as string;

  const validRoles = ["public", "subscriber", "admin"];
  if (!userId || !validRoles.includes(role)) {
    return { error: "Invalid role or user." };
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

// ─── DRAW ENGINE ───────────────────────────────────────────────

export async function runDraw(prevState: any, formData: FormData) {
  const { supabase } = await assertAdmin();
  const mode = (formData.get("mode") as string) || "random";

  // 1. Get active subscribers
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");

  if (!activeSubs || activeSubs.length === 0) {
    return { error: "No active subscribers to run a draw." };
  }

  const participants = activeSubs.length;
  // Prize pool: $15/subscriber → 60% goes to prize pool (rest is charity + ops)
  const prizePool = participants * 15 * 0.6;

  // 2. Get scores for all active subscribers (needed for algorithmic mode + matching)
  const userIds = activeSubs.map((s) => s.user_id);
  const { data: scores } = await supabase
    .from("scores")
    .select("user_id, score")
    .in("user_id", userIds);

  const scoresByUser: Record<string, number[]> = {};
  const scoreFrequencies: Record<number, number> = {};
  // Base weight of 1 for all numbers so even unplayed numbers have a small chance
  for (let i = 1; i <= 45; i++) scoreFrequencies[i] = 1;

  for (const s of scores || []) {
    if (!scoresByUser[s.user_id]) scoresByUser[s.user_id] = [];
    scoresByUser[s.user_id].push(s.score);
    if (s.score >= 1 && s.score <= 45) {
      scoreFrequencies[s.score] += 50; // heavily increased weight for testing visibility
    }
  }

  // 3. Number pool: 1–45 (Stableford range) - Pick 5 DISTINCT numbers
  const drawnNumbers: number[] = [];
  const available = Array.from({ length: 45 }, (_, i) => i + 1);

  if (mode === "algorithmic") {
    // Weighted selection (without replacement)
    while (drawnNumbers.length < 5 && available.length > 0) {
      const totalWeight = available.reduce((sum, n) => sum + scoreFrequencies[n], 0);
      let rand = Math.random() * totalWeight;
      let selectedNumber = available[0];
      for (const n of available) {
        rand -= scoreFrequencies[n];
        if (rand <= 0) {
          selectedNumber = n;
          break;
        }
      }
      drawnNumbers.push(selectedNumber);
      available.splice(available.indexOf(selectedNumber), 1);
    }
  } else {
    // Pure random without replacement
    while (drawnNumbers.length < 5) {
      const idx = Math.floor(Math.random() * available.length);
      drawnNumbers.push(available[idx]);
      available.splice(idx, 1);
    }
  }

  // 4. Create draw record
  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .insert({
      draw_date: new Date().toISOString(),
      status: "published", // Automatically publish so it shows up
      prize_pool: prizePool,
      draw_type: mode,
    })
    .select()
    .single();

  if (drawError || !draw) {
    return { error: "Failed to create draw: " + drawError?.message };
  }

  // 4. Determine match type per user
  const fiveMatchWinners: string[] = [];
  const fourMatchWinners: string[] = [];
  const threeMatchWinners: string[] = [];

  for (const sub of activeSubs) {
    const userScores = scoresByUser[sub.user_id] || [];
    const uniqueUserScores = Array.from(new Set(userScores));
    const matches = uniqueUserScores.filter((score) =>
      drawnNumbers.includes(score)
    ).length;

    if (matches >= 5) fiveMatchWinners.push(sub.user_id);
    else if (matches === 4) fourMatchWinners.push(sub.user_id);
    else if (matches === 3) threeMatchWinners.push(sub.user_id);
  }

  // 5. Calculate prizes (PRD: 40% / 35% / 25%)
  const winningsToInsert: any[] = [];

  const fiveShare = prizePool * 0.4;
  const fourShare = prizePool * 0.35;
  const threeShare = prizePool * 0.25;

  for (const uid of fiveMatchWinners) {
    winningsToInsert.push({
      user_id: uid,
      draw_id: draw.id,
      match_type: "5-match",
      amount: fiveMatchWinners.length > 0 ? fiveShare / fiveMatchWinners.length : 0,
      status: "pending",
    });
  }
  for (const uid of fourMatchWinners) {
    winningsToInsert.push({
      user_id: uid,
      draw_id: draw.id,
      match_type: "4-match",
      amount: fourMatchWinners.length > 0 ? fourShare / fourMatchWinners.length : 0,
      status: "pending",
    });
  }
  for (const uid of threeMatchWinners) {
    winningsToInsert.push({
      user_id: uid,
      draw_id: draw.id,
      match_type: "3-match",
      amount: threeMatchWinners.length > 0 ? threeShare / threeMatchWinners.length : 0,
      status: "pending",
    });
  }

  if (winningsToInsert.length > 0) {
    const { error: winError } = await supabase
      .from("winnings")
      .insert(winningsToInsert);
    if (winError) return { error: "Draw created but failed to save winners: " + winError.message };
  }

  // If no 5-match winner, rollover note
  const rolloverNote = fiveMatchWinners.length === 0
    ? " No 5-match winner — jackpot rolls over to next draw."
    : "";

  revalidatePath("/dashboard/admin/draws");
  revalidatePath("/dashboard/admin/verification");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Draw executed! ${winningsToInsert.length} winner(s) across ${participants} participants. Pool: $${prizePool.toFixed(2)}.${rolloverNote}`,
    drawnNumbers,
  };
}

// ─── WINNER VERIFICATION ───────────────────────────────────────

export async function updateWinningStatus(formData: FormData) {
  const { supabase } = await assertAdmin();
  const winningId = formData.get("winning_id") as string;
  const action = formData.get("action") as string;

  const statusMap: Record<string, string> = {
    verify: "verified",
    pay: "paid",
    reject: "rejected",
  };

  const newStatus = statusMap[action];
  if (!newStatus || !winningId) return { error: "Invalid action." };

  const { error } = await supabase
    .from("winnings")
    .update({ status: newStatus })
    .eq("id", winningId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/verification");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── TEST SIMULATOR ────────────────────────────────────────────

export async function simulateWin() {
  const { user } = await assertAdmin();

  // We need the admin client to bypass RLS for creating draws/winnings
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Create a dummy draw
  const { data: draw, error: drawError } = await supabaseAdmin
    .from("draws")
    .insert({
      draw_date: new Date().toISOString(),
      status: "published",
      prize_pool: 100, // Reduced from 1000 for realistic simulation
      draw_type: "algorithmic", // Must match CHECK constraint: random or algorithmic
    })
    .select()
    .single();

  if (drawError || !draw) {
    console.error("Simulation Draw Error:", drawError);
    return { error: "Failed to create dummy draw: " + (drawError?.message || "Unknown error") };
  }

  // 2. Insert a 5-match win for the CURRENT AUTHENTICATED USER
  const { error: winError } = await supabaseAdmin
    .from("winnings")
    .insert({
      user_id: user.id,
      draw_id: draw.id,
      match_type: "5-match",
      amount: 40.00, // 40% of the $100 test pool
      status: "pending",
    });

  if (winError) {
    console.error("Simulation Winnings Error:", winError);
    return { error: "Failed to insert simulated win: " + winError.message };
  }

  revalidatePath("/dashboard/admin/verification");
  revalidatePath("/dashboard");

  return { success: true, message: "Simulation successful! You (the admin) are now a jackpot winner. Check your Dashboard Overview." };
}
