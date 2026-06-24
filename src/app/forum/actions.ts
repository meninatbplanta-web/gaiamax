"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTopic(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const categoryId = String(formData.get("category_id"));
  const slug = String(formData.get("slug"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title || !body) {
    redirect(`/forum/${slug}/novo?erro=${encodeURIComponent("Preencha o título e a mensagem.")}`);
  }

  const { data: topic, error } = await supabase
    .from("forum_topics")
    .insert({ category_id: categoryId, author_id: user.id, title })
    .select("id")
    .single();

  if (error || !topic) {
    redirect(`/forum/${slug}/novo?erro=${encodeURIComponent(error?.message ?? "Erro ao criar tópico.")}`);
  }

  await supabase.from("forum_posts").insert({
    topic_id: (topic as any).id,
    author_id: user.id,
    body,
  });

  redirect(`/forum/topico/${(topic as any).id}`);
}

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const topicId = String(formData.get("topic_id"));
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    redirect(`/forum/topico/${topicId}`);
  }

  const { error } = await supabase.from("forum_posts").insert({
    topic_id: topicId,
    author_id: user.id,
    body,
  });

  if (error) {
    redirect(`/forum/topico/${topicId}?erro=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}`);
}
