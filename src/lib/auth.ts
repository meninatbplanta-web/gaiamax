import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export type Role = "aluno" | "instrutor" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  role: Role;
  avatar_url: string | null;
  username: string | null;
  username_set: boolean;
};

export async function getUserAndProfile(): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, username, username_set")
    .eq("id", user.id)
    .single();

  return { user, profile: (profile as Profile) ?? null };
}

export async function requireUser() {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  return { user, profile };
}

export async function requireRole(roles: Role[]) {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (!profile || !roles.includes(profile.role)) redirect("/conta");
  return { user, profile };
}
