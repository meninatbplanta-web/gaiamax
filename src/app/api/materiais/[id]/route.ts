import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Download protegido de material: confirma acesso via RLS e devolve URL assinada.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", _req.url));
  }

  // A RLS de materials só retorna a linha se o usuário tiver acesso (matrícula/dono/admin).
  const { data: material } = await supabase
    .from("materials")
    .select("file_path, name")
    .eq("id", params.id)
    .single();

  if (!material) {
    return new NextResponse("Sem acesso a este material.", { status: 403 });
  }

  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from("lesson-materials")
    .createSignedUrl(material.file_path, 120);

  if (error || !signed) {
    return new NextResponse("Não foi possível gerar o download.", { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
