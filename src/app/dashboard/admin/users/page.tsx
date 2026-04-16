import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { updateUserRole } from "../actions";
import type { FC } from "react";

import RoleUpdateForm from "./RoleUpdateForm";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all users to get emails (identifiable information)
  const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
  const emails = Object.fromEntries((userData?.users || []).map((u) => [u.id, u.email]));

  // Join profiles with auth users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, selected_charity_id, charity_contribution_percentage, created_at, charities(name)")
    .order("created_at", { ascending: false });

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, status, plan");

  const subsByUser = Object.fromEntries(
    (subscriptions || []).map((s) => [s.user_id, s])
  );

  const { data: scoreCounts } = await supabase
    .from("scores")
    .select("user_id");

  const scoreCountByUser = (scoreCounts || []).reduce(
    (acc, s) => {
      acc[s.user_id] = (acc[s.user_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Admin · Users</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          User Management
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          View and manage all registered users, their roles, and subscription status.
        </p>
      </div>

      <div className="brand-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Email", "Role", "Subscription", "Charity", "Scores", "Contribution %", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(profiles || []).map((p: any) => {
                const sub = subsByUser[p.id];
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-xs text-[#111]">
                      {emails[p.id] || "Unknown User"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                          p.role === "admin"
                            ? "bg-[#e63946] text-white"
                            : p.role === "subscriber"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sub ? (
                        <span
                          className={`text-xs font-bold capitalize ${
                            sub.status === "active"
                              ? "text-green-600"
                              : "text-orange-500"
                          }`}
                        >
                          {sub.plan} · {sub.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                      {p.charities?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-black text-[#111] text-center">
                      {scoreCountByUser[p.id] ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-[#e63946] text-center">
                      {p.charity_contribution_percentage}%
                    </td>
                    <td className="px-4 py-3">
                      <RoleUpdateForm userId={p.id} defaultRole={p.role} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
