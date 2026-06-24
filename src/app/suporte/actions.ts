"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, escapeHtml } from "@/lib/email";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "meninatbplanta@gmail.com";

async function myName(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
  return data?.full_name ?? "Usuário";
}

export async function createThread(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subject = String(formData.get("subject") ?? "").trim();
  const courseId = String(formData.get("course_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!subject || !body) redirect("/suporte?erro=1");

  const name = await myName(supabase, user.id);
  const { data: thread, error } = await supabase
    .from("support_threads")
    .insert({ user_id: user.id, course_id: courseId || null, subject })
    .select("id")
    .single();
  if (error || !thread) redirect("/suporte?erro=1");

  await supabase.from("support_messages").insert({
    thread_id: thread.id,
    sender_id: user.id,
    body,
  });

  await sendEmail({
    to: ADMIN_EMAIL,
    toName: "Suporte GaiaMax",
    subject: `Nova dúvida: ${subject}`,
    html: `<p><strong>${escapeHtml(name)}</strong> abriu uma dúvida:</p><p><strong>${escapeHtml(subject)}</strong></p><p>${escapeHtml(body)}</p>`,
  });

  redirect(`/suporte/${thread.id}`);
}

export async function postMessage(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const threadId = String(formData.get("thread_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    revalidatePath(`/suporte/${threadId}`);
    return;
  }

  const name = await myName(supabase, user.id);
  await supabase.from("support_messages").insert({
    thread_id: threadId,
    sender_id: user.id,
    body,
  });
  await supabase
    .from("support_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  // Notificação best-effort
  try {
    const { data: thread } = await supabase
      .from("support_threads")
      .select("user_id, subject")
      .eq("id", threadId)
      .single();
    if (thread) {
      if (thread.user_id === user.id) {
        await sendEmail({
          to: ADMIN_EMAIL,
          toName: "Suporte GaiaMax",
          subject: `Nova resposta: ${thread.subject}`,
          html: `<p><strong>${escapeHtml(name)}</strong> respondeu:</p><p>${escapeHtml(body)}</p>`,
        });
      } else {
        const admin = createAdminClient();
        const { data: u } = await admin.auth.admin.getUserById(thread.user_id);
        const email = u?.user?.email;
        if (email) {
          await sendEmail({
            to: email,
            toName: "Aluno",
            subject: `Resposta à sua dúvida — GaiaMax`,
            html: `<p>Você recebeu uma resposta na sua dúvida <strong>${escapeHtml(thread.subject)}</strong>:</p><p>${escapeHtml(body)}</p>`,
          });
        }
      }
    }
  } catch {
    // ignora
  }

  revalidatePath(`/suporte/${threadId}`);
}

export async function setThreadStatus(formData: FormData) {
  const supabase = createClient();
  const threadId = String(formData.get("thread_id"));
  const status = String(formData.get("status"));
  await supabase.from("support_threads").update({ status }).eq("id", threadId);
  revalidatePath(`/suporte/${threadId}`);
}
