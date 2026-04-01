import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#111] font-sans transition-colors duration-500">
      <header className="border-b border-red-900/10 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm shadow-red-900/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-extrabold text-xl tracking-tighter text-[#e63946]">
            PLAY FOR PURPOSE <span className="text-gray-400 text-sm ml-2">[ADMIN]</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-bold tracking-wide">
            <Link href="/admin" className="text-gray-500 hover:text-[#e63946] transition-colors">Dashboard</Link>
            <Link href="/admin/draws" className="text-gray-500 hover:text-[#e63946] transition-colors">Draw Management</Link>
            <Link href="/admin/users" className="text-gray-500 hover:text-[#e63946] transition-colors">User Profiles</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-[#111] transition-colors ml-4 border-l border-gray-200 pl-6">Exit Admin</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
