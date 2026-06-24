import { createClient } from "@/lib/supabase/server";

export type ThreadRow = {
  id: string;
  user_id: string;
  course_id: string | null;
  subject: string;
  status: "aberta" | "resolvida";
  created_at: string;
  updated_at: string;
  course?: { title: string } | null;
};

// Retorna as threads que o usuário pode ver (RLS: próprias + dos seus cursos + admin vê tudo).
export async function getVisibleThreads(): Promise<ThreadRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("support_threads")
    .select("*, course:course_id(title)")
    .order("updated_at", { ascending: false });
  return (data ?? []) as ThreadRow[];
}

export async function getThread(id: string) {
  const supabase = createClient();
  const { data: thread } = await supabase
    .from("support_threads")
    .select("*, course:course_id(title)")
    .eq("id", id)
    .single();
  if (!thread) return null;
  const { data: messages } = await supabase
    .from("support_messages")
    .select("*, sender:sender_id(full_name)")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });
  return { thread: thread as ThreadRow, messages: (messages ?? []) as any[] };
}
