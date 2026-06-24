"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
