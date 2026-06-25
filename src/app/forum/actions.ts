"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Verdadeiro se o post pertence ao usuário E é a última mensagem do tópico.
async function isAuthorOfLastPost(supabase: any, postId: string, userId: string): Promise<boolean> {
  const { data: post } = await supabase
    .from("forum_posts")
    .select("author_id, topic_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post || post.author_id !== userId) return false;
  const { data: lastArr } = await supabase
    .from("forum_posts")
    .select("id")
    .eq("topic_id", post.topic_id)
    .order("created_at", { ascending: false })
    .limit(1);
  return (lastArr?.[0]?.id ?? null) === postId;
}

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

  // Notifica o autor do tópico por e-mail (best-effort), se for outra pessoa.
  try {
    const { data: topic } = await supabase
      .from("forum_topics")
      .select("title, author_id")
      .eq("id", topicId)
      .maybeSingle();
    if (topic && (topic as any).author_id && (topic as any).author_id !== user.id) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const { sendEmail, escapeHtml } = await import("@/lib/email");
      const admin = createAdminClient();
      const { data: au } = await admin.auth.admin.getUserById((topic as any).author_id);
      const email = au?.user?.email;
      if (email) {
        const h = headers();
        const host = h.get("host");
        const proto = h.get("x-forwarded-proto") ?? "https";
        const url = `${proto}://${host}/forum/topico/${topicId}`;
        await sendEmail({
          to: email,
          subject: `Nova resposta em: ${(topic as any).title}`,
          html:
            `<p>Seu tópico "<strong>${escapeHtml((topic as any).title)}</strong>" recebeu uma nova resposta no fórum da GaiaMax.</p>` +
            `<p><a href="${url}">Ver no fórum</a></p>`,
        });
      }
    }
  } catch {
    // best-effort
  }

  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}`);
}

// ---------- Moderação e edição ----------

// Excluir tópico: admin sempre; autor só se ainda não houver respostas.
export async function deleteTopic(formData: FormData) {
  const supabase = createClient();
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");

  const topicId = String(formData.get("topic_id"));
  const slug = String(formData.get("slug"));
  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    const { data: t } = await supabase
      .from("forum_topics")
      .select("author_id")
      .eq("id", topicId)
      .maybeSingle();
    const { count } = await supabase
      .from("forum_posts")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topicId);
    if (!t || (t as any).author_id !== user.id || (count ?? 0) > 1) {
      redirect(`/forum/topico/${topicId}`);
    }
  }

  await supabase.from("forum_topics").delete().eq("id", topicId);
  revalidatePath(`/forum/${slug}`);
  redirect(`/forum/${slug}`);
}

export async function togglePin(formData: FormData) {
  const { profile } = await getUserAndProfile();
  const topicId = String(formData.get("topic_id"));
  if (profile?.role !== "admin") redirect(`/forum/topico/${topicId}`);

  const pinned = formData.get("pinned") === "1";
  const supabase = createClient();
  await supabase.from("forum_topics").update({ is_pinned: !pinned }).eq("id", topicId);
  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}`);
}

export async function toggleLock(formData: FormData) {
  const { profile } = await getUserAndProfile();
  const topicId = String(formData.get("topic_id"));
  if (profile?.role !== "admin") redirect(`/forum/topico/${topicId}`);

  const locked = formData.get("locked") === "1";
  const supabase = createClient();
  await supabase.from("forum_topics").update({ is_locked: !locked }).eq("id", topicId);
  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}`);
}

// Editar post: admin sempre; autor só na última mensagem do tópico.
export async function updatePost(formData: FormData) {
  const supabase = createClient();
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");

  const postId = String(formData.get("post_id"));
  const topicId = String(formData.get("topic_id"));
  const body = String(formData.get("body") ?? "").trim();
  const isAdmin = profile?.role === "admin";

  if (!isAdmin && !(await isAuthorOfLastPost(supabase, postId, user.id))) {
    redirect(`/forum/topico/${topicId}`);
  }

  if (body) {
    await supabase
      .from("forum_posts")
      .update({ body, updated_at: new Date().toISOString() })
      .eq("id", postId);
  }
  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}`);
}

// Excluir post: admin sempre; autor só na última mensagem e desde que não seja a única.
export async function deletePost(formData: FormData) {
  const supabase = createClient();
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");

  const postId = String(formData.get("post_id"));
  const topicId = String(formData.get("topic_id"));
  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    const ok = await isAuthorOfLastPost(supabase, postId, user.id);
    const { count } = await supabase
      .from("forum_posts")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topicId);
    if (!ok || (count ?? 0) <= 1) {
      redirect(`/forum/topico/${topicId}`);
    }
  }

  await supabase.from("forum_posts").delete().eq("id", postId);
  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}`);
}

// ---------- Curtidas ----------
export async function toggleReaction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const postId = String(formData.get("post_id"));
  const topicId = String(formData.get("topic_id"));

  const { data: existing } = await supabase
    .from("forum_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("forum_reactions").delete().eq("id", (existing as any).id);
  } else {
    await supabase.from("forum_reactions").insert({ post_id: postId, user_id: user.id });
  }
  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}`);
}

// ---------- Denúncia ----------
export async function reportPost(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const postId = String(formData.get("post_id"));
  const topicId = String(formData.get("topic_id"));
  const reason = String(formData.get("reason") ?? "").trim();

  await supabase.from("forum_reports").insert({
    post_id: postId,
    reporter_id: user.id,
    reason,
  });
  revalidatePath(`/forum/topico/${topicId}`);
  redirect(`/forum/topico/${topicId}?denunciado=1`);
}
