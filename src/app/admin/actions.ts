"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function executeDrawSimulation() {
  const supabase = await createClient();

  // 1. Ensure caller is Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  // 2. Get active subscribers
  // NOTE: For simulation and testing, if there are no active subscribers, we fallback to all profiles.
  let { data: subscribers } = await supabase.from("subscriptions").select("user_id").eq("status", "active");
  
  if (!subscribers || subscribers.length === 0) {
    // Mock data approach for testing
    const { data: allProfiles } = await supabase.from("profiles").select("id").neq("role", "admin");
    subscribers = (allProfiles || []).map(p => ({ user_id: p.id }));
  }

  const participants = subscribers.length;
  // Prize pool simulation: e.g. $10 per participant goes to the pool
  const prizePool = participants * 10;

  // 3. Create Draw Record
  const { data: draw, error: drawError } = await supabase.from("draws").insert({
    total_participants: participants,
    prize_pool: prizePool,
    status: 'pending_verification'
  }).select().single();

  if (drawError || !draw) throw new Error("Draw creation failed");

  if (participants > 0) {
    // 4. Select Winners randomly (Max 3 for this simulation)
    const shuffled = [...subscribers].sort(() => 0.5 - Math.random());
    const winners = shuffled.slice(0, Math.min(3, participants));
    const winnerIds = winners.map(w => w.user_id);

    // Prize distribution
    const firstPrize = prizePool * 0.5;
    const secondPrize = prizePool * 0.3;
    const thirdPrize = prizePool * 0.2;
    const prizes = [firstPrize, secondPrize, thirdPrize];

    // 5. Create Draw Entries
    const entries = subscribers.map(sub => {
      const winnerIndex = winnerIds.indexOf(sub.user_id);
      const isWinner = winnerIndex !== -1;
      return {
        draw_id: draw.id,
        user_id: sub.user_id,
        is_winner: isWinner,
        prize_amount: isWinner ? prizes[winnerIndex] : 0,
        status: isWinner ? 'pending' : 'verified' // non-winners are verified implicitly
      };
    });

    await supabase.from("draw_entries").insert(entries);
  }

  revalidatePath("/admin");
}
