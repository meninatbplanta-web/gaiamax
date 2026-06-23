import { createClient } from "@/lib/supabase/server";

export type CourseRow = {
  id: string;
  instructor_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  cover_url: string | null;
  level: "iniciante" | "intermediario" | "avancado";
  price_cents: number;
  is_free: boolean;
  status: "rascunho" | "em_revisao" | "publicado" | "arquivado";
  created_at: string;
};

export const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

export const LEVEL_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export async function getMyCourses(): Promise<CourseRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as CourseRow[];
}

// Arvore completa do curso para o editor (modulos -> aulas -> materiais + aulas ao vivo)
export async function getCourseTree(courseId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*, materials(*))), live_sessions(*)")
    .eq("id", courseId)
    .single();
  if (!data) return null;
  const course = data as any;
  course.modules = (course.modules ?? []).sort(
    (a: any, b: any) => a.position - b.position
  );
  for (const m of course.modules) {
    m.lessons = (m.lessons ?? []).sort(
      (a: any, b: any) => a.position - b.position
    );
  }
  course.live_sessions = (course.live_sessions ?? []).sort(
    (a: any, b: any) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );
  return course;
}

// ---------- Catálogo público (Fase 5) ----------
export async function getPublishedCourses(
  opts: { search?: string; category?: string; free?: string } = {}
): Promise<CourseRow[]> {
  const supabase = createClient();
  let q = supabase
    .from("courses")
    .select("*")
    .eq("status", "publicado")
    .order("created_at", { ascending: false });
  if (opts.search) q = q.ilike("title", `%${opts.search}%`);
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.free === "1") q = q.eq("is_free", true);
  if (opts.free === "0") q = q.eq("is_free", false);
  const { data } = await q;
  return (data ?? []) as CourseRow[];
}

export async function getCategories(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select("category")
    .eq("status", "publicado");
  const set = new Set<string>();
  for (const r of (data ?? []) as { category: string | null }[]) {
    if (r.category) set.add(r.category);
  }
  return Array.from(set).sort();
}

export async function getPublicCourse(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select(
      "*, modules(id,title,position,lessons(id,title,position,is_preview)), instructor:instructor_id(full_name, avatar_url)"
    )
    .eq("id", id)
    .eq("status", "publicado")
    .single();
  if (!data) return null;
  const course = data as any;
  course.modules = (course.modules ?? []).sort(
    (a: any, b: any) => a.position - b.position
  );
  for (const m of course.modules) {
    m.lessons = (m.lessons ?? []).sort(
      (a: any, b: any) => a.position - b.position
    );
  }
  return course;
}
