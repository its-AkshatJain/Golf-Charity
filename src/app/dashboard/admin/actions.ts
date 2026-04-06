"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendWinnerNotification, sendDrawPublishedNotification } from "@/utils/email";

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

export async function updateUserRole(prevState: any, formData: FormData) {
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
    .select("user_id, score, date")
    .in("user_id", userIds);

  const rawScoresByUser: Record<string, Array<{date: string; score: number}>> = {};
  for (const s of scores || []) {
    if (!rawScoresByUser[s.user_id]) rawScoresByUser[s.user_id] = [];
    rawScoresByUser[s.user_id].push(s);
  }

  const scoresByUser: Record<string, number[]> = {};
  const scoreFrequencies: Record<number, number> = {};
  // Base weight of 1 for all numbers so even unplayed numbers have a small chance
  for (let i = 1; i <= 45; i++) scoreFrequencies[i] = 1;

  for (const uid in rawScoresByUser) {
    const sorted = rawScoresByUser[uid].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest5 = sorted.slice(0, 5).map(s => s.score);
    scoresByUser[uid] = latest5;

    for (const score of latest5) {
      if (score >= 1 && score <= 45) {
        scoreFrequencies[score] += 50; // heavily increased weight for testing visibility
      }
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

  // 3.5 Calculate Jackpot Rollover
  const { data: pastDraws } = await supabase
    .from("draws")
    .select("id, prize_pool, winnings(match_type)")
    .eq("status", "published")
    .order("draw_date", { ascending: true });

  let jackpotRollover = 0;
  if (pastDraws?.length) {
    for (const d of pastDraws) {
      const has5Match = d.winnings?.some((w: any) => w.match_type === "5-match");
      if (has5Match) {
        jackpotRollover = 0;
      } else {
        jackpotRollover += d.prize_pool * 0.40;
      }
    }
  }

  // 4. Create draw record
  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .insert({
      draw_date: new Date().toISOString(),
      status: "simulated", // Wait for admin confirmation before publish
      prize_pool: prizePool, // Only store the base pool here!
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

  const fiveShare = (prizePool * 0.4) + jackpotRollover;
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
    ? ` No 5-match winner — $${fiveShare.toFixed(2)} jackpot rolls over!`
    : "";

  revalidatePath("/dashboard/admin/draws");
  revalidatePath("/dashboard/admin/verification");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Draw simulated! ${winningsToInsert.length} winner(s) across ${participants} participants. Total Pool: $${(prizePool + jackpotRollover).toFixed(2)}.${rolloverNote}`,
    drawnNumbers,
  };
}

export async function publishDraw(drawId: string) {
  const { supabase } = await assertAdmin();
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: draw, error } = await supabase
    .from("draws")
    .update({ status: "published" })
    .eq("id", drawId)
    .select()
    .single();

  if (error || !draw) return { error: "Failed to publish draw." };

  const { data: winnings } = await supabase
    .from("winnings")
    .select("user_id, amount, match_type")
    .eq("draw_id", drawId);

  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");

  const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
  const emailsMap = Object.fromEntries((userData?.users || []).map((u) => [u.id, u.email]));

  if (winnings) {
    for (const win of winnings) {
      const email = emailsMap[win.user_id];
      if (email) {
        sendWinnerNotification(email, win.amount, win.match_type).catch(console.error);
      }
    }
  }

  const broadcastEmails = (activeSubs || []).map(s => emailsMap[s.user_id]).filter(Boolean) as string[];
  if (broadcastEmails.length > 0) {
    sendDrawPublishedNotification(broadcastEmails, draw.prize_pool, []).catch(console.error);
  }

  revalidatePath("/dashboard/admin/draws");
  revalidatePath("/dashboard/admin/verification");
  revalidatePath("/dashboard");
  return { success: true };
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

  // 1. Calculate realistic active subscribers pool
  const { data: activeSubs } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");

  const participants = activeSubs?.length || 0;
  const prizePool = participants * 15 * 0.6; // Base pool

  // 2. Compute exact rollover jackpot dynamically
  const { data: pastDraws } = await supabaseAdmin
    .from("draws")
    .select("id, prize_pool, winnings(match_type)")
    .eq("status", "published")
    .order("draw_date", { ascending: true });

  let jackpotRollover = 0;
  if (pastDraws?.length) {
    for (const d of pastDraws) {
      const has5Match = d.winnings?.some((w: any) => w.match_type === "5-match");
      if (has5Match) {
        jackpotRollover = 0;
      } else {
        jackpotRollover += d.prize_pool * 0.40;
      }
    }
  }

  // 3. Create a dummy draw in simulated state
  const { data: draw, error: drawError } = await supabaseAdmin
    .from("draws")
    .insert({
      draw_date: new Date().toISOString(),
      status: "simulated",
      prize_pool: prizePool,
      draw_type: "random",
    })
    .select()
    .single();

  if (drawError || !draw) return { error: "Failed to create dummy draw: " + drawError?.message };

  // 4. Calculate exact jackpot hitting
  const fiveShare = (prizePool * 0.4) + jackpotRollover;

  // 5. Insert a 5-match win for the CURRENT AUTHENTICATED USER
  const { error: winError } = await supabaseAdmin
    .from("winnings")
    .insert({
      user_id: user.id,
      draw_id: draw.id,
      match_type: "5-match",
      amount: fiveShare,
      status: "pending",
    });

  if (winError) return { error: "Failed to insert test win: " + winError.message };

  revalidatePath("/dashboard/admin/draws");
  revalidatePath("/dashboard/admin/verification");
  revalidatePath("/dashboard");

  return { success: true, message: `Testing Only: You hit the jackpot! $${fiveShare.toFixed(2)} allocated. Check the Dashboard Overview.` };
}
