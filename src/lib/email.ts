// Envio de e-mail transacional via API HTTP do Brevo (best-effort).
// Só envia se BREVO_API_KEY estiver definido nas variáveis de ambiente.
export async function sendEmail(opts: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}) {
  const key = process.env.BREVO_API_KEY;
  if (!key) return; // notificações desativadas até configurar a chave
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "files.rotalivre@gmail.com";
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": key,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: "GaiaMax" },
        to: [{ email: opts.to, name: opts.toName ?? opts.to }],
        subject: opts.subject,
        htmlContent: opts.html,
      }),
    });
  } catch {
    // best-effort: ignora falhas de notificação
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
