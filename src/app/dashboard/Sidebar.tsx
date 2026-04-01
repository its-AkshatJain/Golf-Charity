"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; emoji: string };

const subscriberNav: NavItem[] = [
  { href: "/dashboard",              label: "Overview",    emoji: "◈" },
  { href: "/dashboard/scores",       label: "My Scores",   emoji: "◉" },
  { href: "/dashboard/charities",    label: "Charities",   emoji: "♡" },
  { href: "/dashboard/subscription", label: "Membership",  emoji: "◎" },
];

const adminNav: NavItem[] = [
  { href: "/dashboard/admin",              label: "Admin Overview", emoji: "⚙" },
  { href: "/dashboard/admin/users",        label: "Users",          emoji: "◉◉" },
  { href: "/dashboard/admin/charities",    label: "Charity CMS",    emoji: "♡+" },
  { href: "/dashboard/admin/draws",        label: "Draw Engine",    emoji: "⬡" },
  { href: "/dashboard/admin/verification", label: "Verify Winners", emoji: "✓" },
];

export default function Sidebar({
  isAdmin,
  userEmail,
}: {
  isAdmin: boolean;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group ${
          active
            ? "bg-[#0d0d0d] text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
            : "text-[#666] hover:bg-[#f0ece4] hover:text-[#0d0d0d]"
        }`}
      >
        <span className={`text-base w-5 text-center font-mono shrink-0 transition-colors ${active ? "text-[#e63946]" : "text-gray-400 group-hover:text-[#0d0d0d]"}`}>
          {item.emoji}
        </span>
        <span className="truncate tracking-tight">{item.label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e63946] shrink-0 animate-pulse" />}
      </Link>
    );
  };

  const avatarLetter = userEmail?.[0]?.toUpperCase() ?? "?";

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-7 pb-5 border-b border-[#ebebeb]">
        <Link href="/dashboard" className="block">
          <span className="font-black text-[15px] tracking-[0.04em] text-[#e63946] uppercase">
            Play for Purpose
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Live Platform</span>
          </div>
        </Link>
      </div>

      {/* Subscriber nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        {subscriberNav.map((item) => <NavLink key={item.href} item={item} />)}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-1 flex items-center gap-2">
              <div className="flex-1 h-px bg-[#ebebeb]" />
              <span className="text-[9px] font-black text-[#e63946] uppercase tracking-[0.2em] shrink-0">Admin</span>
              <div className="flex-1 h-px bg-[#ebebeb]" />
            </div>
            {adminNav.map((item) => <NavLink key={item.href} item={item} />)}
          </>
        )}
      </nav>

      {/* Bottom user panel */}
      <div className="px-3 pb-5 pt-4 border-t border-[#ebebeb] space-y-2">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#f8f5ef]">
          <div className="w-8 h-8 rounded-full bg-[#0d0d0d] text-white text-xs font-black flex items-center justify-center shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0d0d0d] truncate">{userEmail}</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
              {isAdmin ? (
                <span className="text-[#e63946] font-black">Administrator</span>
              ) : (
                "Subscriber"
              )}
            </p>
          </div>
        </div>

        {/* Sign out — red-highlighted so it's unmissable */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-bold text-[#e63946] border-2 border-[#fce8e9] bg-[#fff5f5] hover:bg-[#e63946] hover:text-white hover:border-[#e63946] transition-all duration-200 group"
          >
            <span className="text-base">→</span>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-[#ebebeb]">
        <SidebarContent />
      </aside>

      {/* ─── MOBILE TOP BAR ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#ebebeb] flex items-center justify-between px-4 h-14 shadow-sm">
        <Link href="/dashboard" className="font-black text-[14px] tracking-tight text-[#e63946] uppercase">
          Play for Purpose
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-[#f3f0ea] transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`block w-5 h-0.5 bg-[#0d0d0d] transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#0d0d0d] transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#0d0d0d] transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14 w-full" />

      {/* ─── MOBILE DRAWER ─── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
