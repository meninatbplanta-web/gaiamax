import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Recebe o retorno de confirmacao de e-mail, reset de senha e OAuth (Google).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/conta";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?erro=${encodeURIComponent("Nao foi possivel concluir a autenticacao.")}`
  );
}
