import { createClient } from "@/lib/supabase/server";

export type ForumCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
};

export async function getForumCategories(): Promise<ForumCategory[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, position")
    .order("position", { ascending: true });
  return (data ?? []) as ForumCategory[];
}

export async function getForumCategory(slug: string) {
  const supabase = createClient();
  const { data: category } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, position")
    .eq("slug", slug)
    .maybeSingle();
  if (!category) return null;

  const { data: topics } = await supabase
    .from("forum_topics")
    .select(
      "id, title, is_pinned, is_locked, created_at, updated_at, author_id, author:author_id(full_name), posts:forum_posts(count)"
    )
    .eq("category_id", (category as any).id)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  return { category: category as ForumCategory, topics: (topics ?? []) as any[] };
}

export async function getForumTopic(id: string) {
  const supabase = createClient();
  const { data: topic } = await supabase
    .from("forum_topics")
    .select(
      "id, title, is_pinned, is_locked, created_at, category:category_id(name, slug), author:author_id(full_name)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!topic) return null;

  const { data: posts } = await supabase
    .from("forum_posts")
    .select("id, body, created_at, author_id, author:author_id(full_name)")
    .eq("topic_id", id)
    .order("created_at", { ascending: true });

  return { topic: topic as any, posts: (posts ?? []) as any[] };
}

export type CourseBadge = { role_context: string; course_title: string };

export async function getUserCourseBadges(userId: string): Promise<CourseBadge[]> {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_user_course_badges", { p_user: userId });
  return (data ?? []) as CourseBadge[];
}

export type AuthorMeta = { full_name: string | null; role: string; badges: CourseBadge[] };

// Busca nome, papel e selos de curso de vários autores de uma vez (sem N+1).
export async function getForumAuthorsMeta(userIds: string[]): Promise<Map<string, AuthorMeta>> {
  const map = new Map<string, AuthorMeta>();
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return map;

  const supabase = createClient();
  const [names, badges] = await Promise.all([
    supabase.rpc("get_forum_author_names", { p_users: ids }),
    supabase.rpc("get_users_course_badges", { p_users: ids }),
  ]);

  for (const r of (names.data ?? []) as any[]) {
    map.set(r.user_id, { full_name: r.full_name ?? null, role: r.role ?? "aluno", badges: [] });
  }
  for (const b of (badges.data ?? []) as any[]) {
    const m = map.get(b.user_id) ?? { full_name: null, role: "aluno", badges: [] };
    m.badges.push({ role_context: b.role_context, course_title: b.course_title });
    map.set(b.user_id, m);
  }
  return map;
}
