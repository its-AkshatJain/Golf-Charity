import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const hasActive =
    subscription?.status === "active" ||
    subscription?.status === "trialing";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Membership</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          Your Plan
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current plan status */}
      {subscription && (
        <div className={`brand-card p-6 border-2 ${hasActive ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Current Plan
              </p>
              <p className="text-2xl font-black text-[#111] capitalize tracking-tight">
                {subscription.plan} — {" "}
                <span className={hasActive ? "text-green-600" : "text-orange-600"}>
                  {subscription.status}
                </span>
              </p>
              {subscription.renewal_date && (
                <p className="text-sm text-gray-500 mt-2">
                  {hasActive ? "Renews" : "Ended"}{" "}
                  {new Date(subscription.renewal_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <span className={`text-xl ${hasActive ? "text-green-500" : "text-orange-400"}`}>
              {hasActive ? "✓" : "⚠"}
            </span>
          </div>
        </div>
      )}

      {!hasActive && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly */}
            <PlanCard
              name="Monthly"
              price="$15"
              period="/month"
              priceId={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!}
              features={[
                "Monthly draw entry",
                "Track 5 Stableford scores",
                "Charity contribution routing",
                "Win up to 40% of prize pool",
              ]}
            />
            {/* Yearly */}
            <PlanCard
              name="Annual"
              price="$150"
              period="/year"
              priceId={process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!}
              features={[
                "Everything in Monthly",
                "2 months free (save $30)",
                "Priority draw eligibility",
                "Annual impact report",
              ]}
              highlighted
            />
          </div>
        </>
      )}

      {hasActive && (
        <div className="brand-card p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Need to update payment details or cancel? Manage via Stripe.
          </p>
          <p className="text-xs text-gray-400">
            Contact support to modify your plan details.
          </p>
        </div>
      )}
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  priceId,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  priceId: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-8 flex flex-col gap-6 ${
        highlighted
          ? "bg-[#111] text-white shadow-2xl shadow-black/20"
          : "bg-white border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
      }`}
    >
      {highlighted && (
        <span className="self-start text-[10px] font-black uppercase tracking-widest bg-[#e63946] text-white px-3 py-1 rounded-full">
          Best Value
        </span>
      )}
      <div>
        <h3
          className={`text-xl font-black uppercase tracking-tight ${
            highlighted ? "text-white" : "text-[#111]"
          }`}
        >
          {name}
        </h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-black tracking-tighter">{price}</span>
          <span className={`text-sm font-semibold ${highlighted ? "text-gray-400" : "text-gray-400"}`}>
            {period}
          </span>
        </div>
      </div>
      <ul className="space-y-3 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-center gap-2.5 text-sm font-medium ${
              highlighted ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <span className="text-[#e63946] font-black">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <CheckoutButton priceId={priceId} highlighted={highlighted} />
    </div>
  );
}

function CheckoutButton({
  priceId,
  highlighted,
}: {
  priceId: string;
  highlighted?: boolean;
}) {
  return (
    <form
      action={async () => {
        "use server";
        // This will be handled client-side via fetch — see below note
      }}
    >
      <a
        href={`/api/checkout-redirect?priceId=${encodeURIComponent(priceId)}`}
        className={`block text-center py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
          highlighted
            ? "bg-[#e63946] text-white hover:bg-white hover:text-[#e63946] hover:shadow-xl"
            : "bg-[#111] text-white hover:bg-[#e63946] hover:shadow-lg hover:shadow-red-900/20"
        }`}
      >
        Subscribe {highlighted ? "& Save" : "Monthly"}
      </a>
    </form>
  );
}
