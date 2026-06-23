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
