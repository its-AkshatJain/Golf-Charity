import { redirect } from "next/navigation";

// Redirect legacy /admin URL to new unified dashboard admin
export default function LegacyAdminRedirect() {
  redirect("/dashboard/admin");
}
