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
      "id, title, is_pinned, is_locked, created_at, updated_at, author:author_id(full_name), posts:forum_posts(count)"
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
