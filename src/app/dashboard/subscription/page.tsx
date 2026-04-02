import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const hasActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-1.5">Membership</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">Your Plan</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Subscription includes draw entry, charity routing, and score tracking.
        </p>
      </div>

      {/* Current plan status */}
      {subscription && (
        <div className={`brand-card p-6 ${hasActive ? "border-green-200 border-2" : "border-orange-200 border-2"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Plan</p>
              <p className="text-2xl font-black text-[#111] capitalize tracking-tight">
                {subscription.plan} Tier
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                  hasActive ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                }`}>
                  {subscription.status}
                </span>
                {subscription.renewal_date && (
                  <span className="text-xs text-gray-400 font-medium">
                    {hasActive ? "Renews" : "Ended"}{" "}
                    {new Date(subscription.renewal_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="text-3xl font-black text-[#111] shrink-0">
              {subscription.plan === "monthly" ? "$15/mo" : "$150/yr"}
            </div>
          </div>
        </div>
      )}

      {/* Plan selector — only show if not active */}
      {!hasActive && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-500">
            {subscription ? "Reactivate your subscription:" : "Choose a plan to get started:"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Monthly */}
            <div className="brand-card p-7 flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-black text-[#111] uppercase tracking-tight">Monthly</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-[#111] tracking-tighter">$15</span>
                  <span className="text-sm text-gray-400 font-semibold">/month</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1">
                {["Monthly draw entry", "Track 5 Stableford rounds", "Charity contribution routing", "Access to full dashboard"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#e63946] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/api/checkout-redirect?priceId=${process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID}`}
                className="block text-center py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-[#111] text-white hover:bg-[#e63946] transition-all hover:shadow-lg hover:shadow-red-900/20"
              >
                Subscribe Monthly
              </Link>
            </div>

            {/* Yearly */}
            <div className="relative brand-card p-7 flex flex-col gap-5 !bg-[#111]">
              <div className="absolute top-4 right-4 bg-[#e63946] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Best Value
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  Annual
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black !text-white tracking-tighter">$150</span>
                  <span className="text-sm text-gray-400 font-semibold tracking-wide">/year</span>
                </div>
                <p className="text-xs text-green-400 font-bold mt-1">Save $30 — 2 months free</p>
              </div>
              <ul className="space-y-3 flex-1">
                {["Everything in Monthly", "2 months free ($30 saving)", "Priority draw eligibility", "Annual impact report"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm !text-gray-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#e63946] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/api/checkout-redirect?priceId=${process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID}`}
                className="block text-center py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-[#e63946] text-white hover:bg-white hover:text-[#e63946] transition-all hover:shadow-xl"
              >
                Subscribe Annually
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Manage subscription (active) */}
      {hasActive && (
        <div className="brand-card p-6 text-center">
          <p className="text-sm text-gray-500 font-medium mb-2">
            Need to update billing or cancel your subscription?
          </p>
          <p className="text-xs text-gray-400">
            Contact support or manage your billing directly through Stripe by reaching out to us.
          </p>
        </div>
      )}
    </div>
  );
}
