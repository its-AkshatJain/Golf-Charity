import { getCharities } from "./actions";
import OnboardingFlow from "./OnboardingFlow";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if already fully onboarded
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, selected_charity_id")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const hasActiveAccess =
    profile?.selected_charity_id &&
    subscription &&
    (subscription.status === "active" || subscription.status === "trialing");

  // Already onboarded → go to dashboard
  if (isAdmin || hasActiveAccess) {
    redirect("/dashboard");
  }

  const charities = await getCharities();

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#111] font-[var(--font-inter)] flex flex-col">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tighter text-[#e63946]">
            PLAY FOR PURPOSE
          </span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-gray-400 hover:text-[#111] font-semibold transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-24">
        <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl shadow-black/5 border border-black/5 p-8 md:p-14 overflow-hidden relative">
          {/* Decorative */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-red-50 blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-gray-50 blur-3xl opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <OnboardingFlow charities={charities} />
          </div>
        </div>
      </main>
    </div>
  );
}
