import { getUserAndProfile } from "@/lib/auth";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const { user, profile } = await getUserAndProfile();
  const accountLabel = profile?.full_name?.split(" ")[0] ?? "Minha conta";
  const isAdmin = profile?.role === "admin";
  return (
    <SiteHeaderClient loggedIn={!!user} isAdmin={isAdmin} accountLabel={accountLabel} />
  );
}
