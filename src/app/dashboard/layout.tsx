import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className=" font-bold text-xl tracking-tighter text-white">
            PLAY FOR PURPOSE
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/dashboard/subscription" className="hover:text-white transition-colors">Membership</Link>
            <Link href="/dashboard/scores" className="hover:text-white transition-colors">Enter Scores</Link>
            <Link href="/dashboard/charities" className="hover:text-white transition-colors">Charities</Link>
            {profile?.role === "admin" && (
              <Link href="/admin" className="text-[#ff3c00] hover:text-red-400 font-bold transition-colors">
                Admin Panel
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-gray-400 hover:text-white transition-colors">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
