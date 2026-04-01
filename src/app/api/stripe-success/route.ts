import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// This page is the success_url target: /api/stripe-success?session_id=...
// It fulfils the subscription in the DB then redirects to dashboard.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return Response.redirect(new URL("/dashboard", url.origin));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.redirect(new URL("/login", url.origin));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.status !== "complete" && session.payment_status !== "paid") {
      return Response.redirect(new URL("/dashboard/subscription", url.origin));
    }

    const sub = session.subscription as any;
    if (!sub) {
      return Response.redirect(new URL("/dashboard", url.origin));
    }

    const priceId = sub.items?.data?.[0]?.price?.id;
    const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
      ? "monthly"
      : "yearly";
    const renewalDate = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert subscription (idempotent)
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "active", plan, renewal_date: renewalDate })
        .eq("user_id", user.id);
    } else {
      await supabaseAdmin.from("subscriptions").insert({
        user_id: user.id,
        status: "active",
        plan,
        renewal_date: renewalDate,
      });
    }

    // Promote role from public → subscriber
    await supabaseAdmin
      .from("profiles")
      .update({ role: "subscriber" })
      .eq("id", user.id)
      .eq("role", "public");
  } catch (err) {
    console.error("[stripe-success] Error:", err);
    // Still redirect — let them try the dashboard
  }

  return Response.redirect(new URL("/dashboard", url.origin));
}
