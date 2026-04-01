import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  if (!isAdmin && !hasActiveAccess) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] flex">
      <Sidebar isAdmin={isAdmin ?? false} userEmail={user.email ?? ""} />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 px-4 lg:px-10 py-8 max-w-6xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
