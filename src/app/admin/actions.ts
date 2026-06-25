"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setUserRole(formData: FormData) {
  const supabase = createClient();
  const userId = String(formData.get("user_id"));
  const role = String(formData.get("role"));
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

export async function adminSetCourseStatus(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("course_id"));
  const status = String(formData.get("status"));
  await supabase.from("courses").update({ status }).eq("id", id);
  revalidatePath("/admin/cursos");
}

export async function addMapping(formData: FormData) {
  const supabase = createClient();
  const courseId = String(formData.get("course_id"));
  const provider = String(formData.get("provider"));
  const externalId = String(formData.get("external_product_id") ?? "").trim();
  if (externalId) {
    await supabase.from("product_mappings").insert({
      course_id: courseId,
      provider,
      external_product_id: externalId,
    });
  }
  revalidatePath("/admin/cursos");
}

export async function deleteMapping(formData: FormData) {
  const supabase = createClient();
  await supabase.from("product_mappings").delete().eq("id", String(formData.get("mapping_id")));
  revalidatePath("/admin/cursos");
}

export async function revokeEnrollment(formData: FormData) {
  const supabase = createClient();
  await supabase.from("enrollments").delete().eq("id", String(formData.get("enrollment_id")));
  revalidatePath("/admin/matriculas");
}

export async function grantEnrollment(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const courseId = String(formData.get("course_id"));
  if (!email || !courseId) {
    revalidatePath("/admin/matriculas");
    return;
  }
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const found = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);
  if (found) {
    const supabase = createClient();
    await supabase
      .from("enrollments")
      .insert({ user_id: found.id, course_id: courseId, source: "manual" });
  }
  revalidatePath("/admin/matriculas");
}

// Gera uma senha temporária legível (sem caracteres ambíguos).
function gerarSenhaTemporaria(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Admin reseta a senha de um usuário: define uma senha temporária e marca
// que o usuário deve trocá-la no próximo login. Retorna a senha temporária
// para o admin repassar ao usuário.
export async function resetUserPassword(
  userId: string
): Promise<{ tempPassword?: string; error?: string }> {
  await requireRole(["admin"]);
  if (!userId) return { error: "Usuário inválido." };

  const temp = gerarSenhaTemporaria();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: temp,
    app_metadata: { must_change_password: true },
  });
  if (error) return { error: error.message };

  return { tempPassword: temp };
}

// ---------- Fórum: categorias ----------
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function addForumCategory(formData: FormData) {
  await requireRole(["admin"]);
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const position = Number(formData.get("position") ?? 0) || 0;
  if (!name) {
    revalidatePath("/admin/forum");
    return;
  }
  const supabase = createClient();
  await supabase.from("forum_categories").insert({
    name,
    slug: slugify(name),
    description,
    position,
  });
  revalidatePath("/admin/forum");
  revalidatePath("/forum");
}

export async function deleteForumCategory(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("category_id"));
  const supabase = createClient();
  await supabase.from("forum_categories").delete().eq("id", id);
  revalidatePath("/admin/forum");
  revalidatePath("/forum");
}

// ---------- Fórum: denúncias ----------
export async function resolveReport(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("report_id"));
  const supabase = createClient();
  await supabase.from("forum_reports").update({ status: "resolvida" }).eq("id", id);
  revalidatePath("/admin/forum/denuncias");
}

export async function deleteReportedPost(formData: FormData) {
  await requireRole(["admin"]);
  const postId = String(formData.get("post_id"));
  const supabase = createClient();
  // Excluir o post resolve a denúncia (cascade) e remove o conteúdo.
  await supabase.from("forum_posts").delete().eq("id", postId);
  revalidatePath("/admin/forum/denuncias");
}

// Admin altera o @username de qualquer usuário (sempre permitido).
export async function adminSetUsername(formData: FormData) {
  await requireRole(["admin"]);
  const userId = String(formData.get("user_id"));
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  if (username.length < 3) {
    redirect(`/admin/usuarios?u_erro=${encodeURIComponent("@ inválido (mín. 3; letras, números e _).")}`);
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ username, username_set: true })
    .eq("id", userId);
  if (error) {
    const msg = (error as any).code === "23505" ? "Este @ já está em uso." : error.message;
    redirect(`/admin/usuarios?u_erro=${encodeURIComponent(msg)}`);
  }
  redirect("/admin/usuarios?u_ok=1");
}
