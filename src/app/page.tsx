import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight, Sparkles, ShieldCheck, CreditCard, Heart, Trophy, Zap, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  // Fetch charities and check auth status for adaptive nav
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, featured")
    .order("featured", { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-[#fcf9f2] font-[var(--font-inter)]">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#fcf9f2]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tighter text-[#e63946] select-none">
            PLAY FOR PURPOSE
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="#how-it-works"
              className="text-sm font-bold text-gray-600 hover:text-[#111] transition-colors hidden md:block"
            >
              How it works
            </Link>
            <Link
              href="#charities"
              className="text-sm font-bold text-gray-600 hover:text-[#111] transition-colors hidden md:block"
            >
              Charities
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="bg-[#111] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e63946] transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20"
              >
                Dashboard →
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#111] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e63946] transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/poor-children.avif"
            alt="Children in need — your game makes a difference"
            fill
            className="object-cover object-center"
            priority
            quality={85}
          />
          {/* Layered gradient overlay — dark at bottom, lighter at top */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/90 z-[1]" />
          {/* Subtle red tint to tie brand into emotion */}
          <div className="absolute inset-0 bg-[#e63946]/15 z-[2]" />
          {/* Bottom vignette for smoother transition */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#fcf9f2] to-transparent z-[3]" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-16">
          <p className="font-mono text-xs tracking-[0.4em] uppercase mb-6 font-black drop-shadow-md !text-white">
            Golf · Charity · Impact
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-8 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)] !text-white">
            Every round
            <br />
            funds a future.
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 drop-shadow-sm !text-white">
            You play Stableford. Your subscription enters a monthly draw. Your
            winnings — and your charity's share — change lives. It's that
            simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="bg-[#e63946] text-white px-10 py-5 rounded-2xl text-base font-black tracking-wide hover:bg-white hover:text-[#e63946] transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/30 inline-flex items-center gap-2 group"
            >
              Start Playing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard/admin"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-2xl text-base font-bold hover:bg-white/20 transition-all duration-300 inline-flex items-center gap-2"
            >
              Admin Dashboard
            </Link>
          </div>

          {/* Trust badges — sitting on top of the light vignette footer of the hero */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-16 text-[#111] text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e63946]" />
              Stripe-secured payments
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e63946]" />
              Verified charities
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e63946]" />
              Monthly draws
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-9 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 md:py-36 px-6 bg-[#fcf9f2]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="section-label mb-4">The system</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#111]">
              Three steps. Real impact.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Subscribe",
                icon: <CreditCard className="w-5 h-5" />,
                body: "Choose a monthly ($15) or annual ($150) plan. A portion of every subscription builds the charity pool and funds the monthly prize draw.",
                color: "bg-[#111]",
                textColor: "text-white",
              },
              {
                step: "02",
                title: "Play Golf",
                icon: <Trophy className="w-5 h-5" />,
                body: "Play your normal rounds at your local club. Record your Stableford scores through our simple dashboard. Every point counts.",
                color: "bg-[#e63946]",
                textColor: "text-white",
              },
              {
                step: "03",
                title: "Win & Give",
                icon: <Heart className="w-5 h-5" />,
                body: "Our algorithmic draw picks winners from among active players. If you win, you keep the majority, and your charity gets a massive boost.",
                color: "bg-white border border-[#111]/10",
                textColor: "text-[#111]",
              },
            ].map((s) => (
              <div key={s.step} className={`${s.color} ${s.textColor} p-10 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-xl`}>
                <div className="absolute top-8 right-8 opacity-20 font-black text-6xl tracking-tighter">
                  {s.step}
                </div>
                <div className="mb-6 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{s.title}</h3>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DRAW MECHANICS ─── */}
      <section className="py-24 px-6 bg-[#111] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#e63946] font-mono text-xs tracking-[0.3em] uppercase mb-4 font-semibold">
              Prize Engine
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              How prizes are distributed
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
              The prize pool auto-scales with active subscribers. More players = bigger jackpots for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "1", title: "Monthly Draws", body: "Transparent prize distributions handled every 30 days.", icon: <Sparkles className="w-10 h-10 text-[#e63946]" /> },
              { id: "2", title: "Stripe Secured", body: "Financial operations managed by the world's most trusted processor.", icon: <ShieldCheck className="w-10 h-10 text-blue-500" /> },
              { id: "3", title: "Charity Focus", body: "Direct routing of percentage-based winnings to verified partners.", icon: <Heart className="w-10 h-10 text-red-500" /> },
            ].map((item) => (
              <div key={item.id} className="bg-white/5 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 hover:border-white/20 transition-all text-center group">
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 !text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CHARITIES ─── */}
      <section id="charities" className="py-24 md:py-36 px-6 bg-[#fcf9f2]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4">Verified causes</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#111]">
              Your game. Their future.
            </h2>
            <p className="text-gray-600 mt-4 max-w-xl mx-auto font-medium">
              Choose from our verified charity directory at signup. Switch anytime from your dashboard.
            </p>
          </div>

          {charities && charities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities.map((c) => (
                <div
                  key={c.id}
                  className="brand-card p-6 hover:shadow-2xl hover:shadow-red-900/5 hover:-translate-y-1 transition-all duration-300"
                >
                  {c.featured && (
                    <span className="inline-block bg-[#e63946] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                      Featured
                    </span>
                  )}
                  <h3 className="text-lg font-black text-[#111] tracking-tight">{c.name}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3 font-medium">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
              <p className="text-gray-400 font-medium">Charities are being verified and will be listed soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-24 px-6 bg-[#e63946] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Ready to play with purpose?
          </h2>
          <p className="text-white text-lg mb-10 max-w-xl mx-auto font-medium shadow-black/10">
            Join subscribers using their golf game to fund real-world change. Every round counts.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-3 bg-white text-[#e63946] px-10 py-5 rounded-2xl text-base font-black hover:bg-[#111] hover:text-white transition-all duration-300 hover:shadow-2xl hover:shadow-black/30 group"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#111] text-white/40 py-10 px-6 text-center text-xs">
        <p className="font-bold tracking-wider uppercase mb-2 text-white/60">Play for Purpose</p>
        <p>© {new Date().getFullYear()} All rights reserved. Powered by Stripe & Supabase.</p>
      </footer>
    </div>
  );
}
