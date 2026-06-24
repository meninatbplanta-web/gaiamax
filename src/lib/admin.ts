import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminStats() {
  const supabase = createClient();
  const [u, c, p, e] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "publicado"),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "ativa"),
  ]);
  return {
    users: u.count ?? 0,
    courses: c.count ?? 0,
    published: p.count ?? 0,
    enrollments: e.count ?? 0,
  };
}

export async function getAllUsers() {
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const supabase = createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, role");
  const map = new Map(((profiles ?? []) as any[]).map((p) => [p.id, p]));
  return (list?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    full_name: map.get(u.id)?.full_name ?? null,
    role: (map.get(u.id)?.role ?? "aluno") as string,
    created_at: u.created_at,
  }));
}

export async function getAllCoursesAdmin() {
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:instructor_id(full_name), product_mappings(*)")
    .order("created_at", { ascending: false });
  return (data ?? []) as any[];
}

export async function getAllEnrollments() {
  const supabase = createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("*, course:course_id(title), user:user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as any[];
}

export async function getAllPayments() {
  const supabase = createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as any[];
}
