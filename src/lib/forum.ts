import { createClient } from "@/lib/supabase/server";

export type ForumCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
};

export const TOPICS_PAGE = 20;
export const POSTS_PAGE = 30;

export async function getForumCategories(): Promise<ForumCategory[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, position")
    .order("position", { ascending: true });
  return (data ?? []) as ForumCategory[];
}

export async function getForumCategory(slug: string, page = 1) {
  const supabase = createClient();
  const { data: category } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, position")
    .eq("slug", slug)
    .maybeSingle();
  if (!category) return null;

  const from = (page - 1) * TOPICS_PAGE;
  const to = from + TOPICS_PAGE - 1;

  const { data: topics, count } = await supabase
    .from("forum_topics")
    .select(
      "id, title, is_pinned, is_locked, created_at, updated_at, author_id, author:author_id(full_name), posts:forum_posts(count)",
      { count: "exact" }
    )
    .eq("category_id", (category as any).id)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(from, to);

  return {
    category: category as ForumCategory,
    topics: (topics ?? []) as any[],
    total: count ?? 0,
    page,
    pageSize: TOPICS_PAGE,
  };
}

export async function getForumTopic(id: string, page = 1) {
  const supabase = createClient();
  const { data: topic } = await supabase
    .from("forum_topics")
    .select(
      "id, title, is_pinned, is_locked, created_at, author_id, category:category_id(name, slug), author:author_id(full_name)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!topic) return null;

  const from = (page - 1) * POSTS_PAGE;
  const to = from + POSTS_PAGE - 1;

  const { data: posts, count } = await supabase
    .from("forum_posts")
    .select("id, body, created_at, updated_at, author_id, author:author_id(full_name)", {
      count: "exact",
    })
    .eq("topic_id", id)
    .order("created_at", { ascending: true })
    .range(from, to);

  return {
    topic: topic as any,
    posts: (posts ?? []) as any[],
    total: count ?? 0,
    page,
    pageSize: POSTS_PAGE,
  };
}

export type CourseBadge = { role_context: string; course_title: string };

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

// ---------- Busca ----------
export async function searchForum(q: string) {
  const term = (q ?? "").trim();
  if (!term) return [];
  const supabase = createClient();
  const like = `%${term}%`;

  const { data: byTitle } = await supabase
    .from("forum_topics")
    .select("id, title, updated_at, author_id, category:category_id(name, slug)")
    .ilike("title", like)
    .limit(30);

  const { data: byBody } = await supabase
    .from("forum_posts")
    .select("topic_id")
    .ilike("body", like)
    .limit(60);

  const topicIds = Array.from(new Set((byBody ?? []).map((p: any) => p.topic_id)));
  let byBodyTopics: any[] = [];
  if (topicIds.length) {
    const { data } = await supabase
      .from("forum_topics")
      .select("id, title, updated_at, author_id, category:category_id(name, slug)")
      .in("id", topicIds)
      .limit(30);
    byBodyTopics = data ?? [];
  }

  const map = new Map<string, any>();
  for (const t of [...(byTitle ?? []), ...byBodyTopics]) map.set(t.id, t);
  return Array.from(map.values());
}

// ---------- Curtidas ----------
export async function getReactionsForPosts(postIds: string[], userId?: string) {
  const map = new Map<string, { count: number; mine: boolean }>();
  const ids = Array.from(new Set(postIds.filter(Boolean)));
  if (ids.length === 0) return map;

  const supabase = createClient();
  const { data } = await supabase
    .from("forum_reactions")
    .select("post_id, user_id")
    .in("post_id", ids);

  for (const id of ids) map.set(id, { count: 0, mine: false });
  for (const r of (data ?? []) as any[]) {
    const m = map.get(r.post_id) ?? { count: 0, mine: false };
    m.count += 1;
    if (userId && r.user_id === userId) m.mine = true;
    map.set(r.post_id, m);
  }
  return map;
}

// ---------- Denúncias (admin) ----------
export async function getOpenForumReports() {
  const supabase = createClient();
  const { data } = await supabase
    .from("forum_reports")
    .select("id, reason, status, created_at, post:post_id(id, body, topic_id, author_id)")
    .eq("status", "aberta")
    .order("created_at", { ascending: false });
  return (data ?? []) as any[];
}
