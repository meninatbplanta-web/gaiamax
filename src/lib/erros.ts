// Traduz mensagens de erro de autenticação do Supabase para PT-BR.
export function traduzErroAuth(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("should be different")) return "A nova senha deve ser diferente da senha atual.";
  if (m.includes("at least 6") || m.includes("at least 6 characters")) return "A senha deve ter ao menos 6 caracteres.";
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("user already registered") || m.includes("already been registered")) return "Já existe uma conta com este e-mail.";
  if (m.includes("for security purposes") && m.includes("seconds")) return "Aguarde alguns segundos antes de tentar novamente.";
  return msg;
}
