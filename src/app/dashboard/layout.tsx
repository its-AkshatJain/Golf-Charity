import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const NavLink = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Link
    href={href}
    className={`text-sm font-semibold transition-colors duration-200 hover:text-[#e63946] ${className}`}
  >
    {children}
  </Link>
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  // Redirect non-admins to onboarding if incomplete
  if (!isAdmin && !hasActiveAccess) {
    redirect("/onboarding");
  }

  const subscriberLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/scores", label: "My Scores" },
    { href: "/dashboard/charities", label: "Charities" },
    { href: "/dashboard/subscription", label: "Membership" },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: "Admin Overview" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/charities", label: "Charity CMS" },
    { href: "/dashboard/admin/draws", label: "Draw Engine" },
    { href: "/dashboard/admin/verification", label: "Verify Winners" },
  ];

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#111] font-[var(--font-inter)]">
      {/* ─── TOP NAV ─── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="font-black text-lg tracking-tighter text-[#e63946] shrink-0"
          >
            PLAY FOR PURPOSE
          </Link>

          {/* Main Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {subscriberLinks.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                className="text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                {l.label}
              </NavLink>
            ))}

            {/* Admin-only nav items — rendered inline */}
            {isAdmin && (
              <>
                <span className="w-px h-5 bg-black/10 mx-2" />
                <span className="text-[10px] font-black text-[#e63946] uppercase tracking-widest px-1">
                  Admin
                </span>
                {adminLinks.map((l) => (
                  <NavLink
                    key={l.href}
                    href={l.href}
                    className="text-[#e63946]/70 hover:text-[#e63946] px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    {l.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* Right side: user email + signout */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-400 hidden lg:block font-medium truncate max-w-[160px]">
              {user.email}
            </span>
            {isAdmin && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#e63946] text-white px-2 py-1 rounded-full">
                Admin
              </span>
            )}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm font-semibold text-gray-400 hover:text-[#111] transition-colors pl-3 border-l border-gray-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-black/5 overflow-x-auto">
          <div className="flex items-center gap-1 px-4 py-2 min-w-max">
            {subscriberLinks.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                className="text-gray-500 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin &&
              adminLinks.map((l) => (
                <NavLink
                  key={l.href}
                  href={l.href}
                  className="text-[#e63946] px-3 py-1.5 rounded-lg text-xs bg-red-50 whitespace-nowrap"
                >
                  {l.label}
                </NavLink>
              ))}
          </div>
        </div>
      </header>

      {/* ─── PAGE CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">{children}</main>
    </div>
  );
}
