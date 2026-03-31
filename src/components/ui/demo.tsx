import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#111] flex flex-col font-sans transition-colors duration-500">
      {/* Header / Navbar */}
      <header className="container mx-auto px-6 py-6 border-b border-red-900/10 flex items-center justify-between">
        <div className="flex items-center gap-2 font-extrabold text-xl tracking-tighter text-[#e63946]">
          <HeartHandshake className="text-[#e63946]" strokeWidth={2.5} />
          PLAY FOR PURPOSE
        </div>
        <nav className="flex gap-6 items-center text-sm font-bold tracking-wide">
          <Link href="/login" className="text-gray-500 hover:text-[#e63946] transition-colors">Login</Link>
          <Link href="/dashboard" className="text-gray-500 hover:text-[#e63946] transition-colors">Dashboard</Link>
          <Link href="/admin" className="text-gray-500 hover:text-[#e63946] transition-colors border-l border-red-900/10 pl-6">Admin Panel</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e63946]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <p className="text-[#e63946] font-bold tracking-[0.2em] text-sm uppercase">Global Impact Initiative</p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-[#111]">
            Every score <span className="text-gray-400 line-through">matters</span><br/>
            creates an <span className="text-[#e63946]">impact.</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            The platform that transforms your performance into tangible charity. Enter your Stableford scores, participate in monthly draws, and route your winnings directly to the causes that define you.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-[#111] text-white font-bold tracking-wider uppercase text-sm rounded-lg hover:bg-[#e63946] shadow-lg hover:shadow-[#e63946]/30 transition-all duration-300 w-full sm:w-auto"
            >
              Get Started
            </Link>
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-transparent border-2 border-red-900/10 text-gray-700 font-bold tracking-wider uppercase text-sm rounded-lg hover:border-red-900/30 hover:bg-gray-50 transition-all duration-300 w-full sm:w-auto"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-red-900/10 py-8 text-center text-gray-500 text-sm font-bold tracking-widest uppercase">
        &copy; 2026 GOLF IMPACT &mdash; Verified Charity Protocol
      </footer>
    </div>
  );
}
