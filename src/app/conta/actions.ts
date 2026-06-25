"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { traduzErroAuth } from "@/lib/erros";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteMyAccount() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Remove a conta de autenticação; o ON DELETE CASCADE limpa o perfil e dados associados.
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
  redirect("/?conta_excluida=1");
}

// Atualiza os dados do perfil (nome e, opcionalmente, e-mail).
export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!fullName) {
    redirect(`/conta?erro=${encodeURIComponent("Informe seu nome.")}`);
  }

  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  await supabase.auth.updateUser({ data: { full_name: fullName } });

  let emailPendente = false;
  if (email && email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      redirect(`/conta?erro=${encodeURIComponent(traduzErroAuth(error.message))}`);
    }
    emailPendente = true;
  }

  revalidatePath("/conta");
  redirect(`/conta?perfil=1${emailPendente ? "&email_pendente=1" : ""}`);
}

// Troca a própria senha (exige nova senha + confirmação).
export async function changePassword(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const senha = String(formData.get("password") ?? "");
  const confirma = String(formData.get("confirm") ?? "");

  if (senha.length < 6) {
    redirect(`/conta?senha_erro=${encodeURIComponent("A senha deve ter ao menos 6 caracteres.")}`);
  }
  if (senha !== confirma) {
    redirect(`/conta?senha_erro=${encodeURIComponent("As senhas não coincidem.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    redirect(`/conta?senha_erro=${encodeURIComponent(traduzErroAuth(error.message))}`);
  }

  // Limpa a marcação de "trocar senha obrigatória", caso exista.
  if ((user.app_metadata as any)?.must_change_password) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { must_change_password: false },
    });
  }

  redirect("/conta?senha=1");
}
