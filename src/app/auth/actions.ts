"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { traduzErroAuth } from "@/lib/erros";

function originUrl() {
  const h = headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${originUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/cadastro?erro=${encodeURIComponent(error.message)}`);
  }
  redirect("/cadastro?ok=1");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?erro=${encodeURIComponent(traduzErroAuth(error.message))}`);
  }
  redirect("/conta");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${originUrl()}/auth/callback?next=/redefinir-senha`,
  });
  // Sempre confirma, sem revelar se o e-mail existe.
  redirect("/esqueci-senha?ok=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    redirect(`/redefinir-senha?erro=${encodeURIComponent("A senha deve ter ao menos 6 caracteres.")}`);
  }
  if (password !== confirm) {
    redirect(`/redefinir-senha?erro=${encodeURIComponent("As senhas não coincidem.")}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/redefinir-senha?erro=${encodeURIComponent(traduzErroAuth(error.message))}`);
  }

  // Remove a marcação de troca obrigatória (caso a senha tenha sido resetada pelo admin).
  if (user && (user.app_metadata as any)?.must_change_password) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { must_change_password: false },
    });
  }

  redirect("/conta?senha=1");
}
