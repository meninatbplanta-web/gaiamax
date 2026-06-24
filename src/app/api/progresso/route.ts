import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Marca uma aula como concluída (chamado automaticamente pelo player ao terminar o vídeo).
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let lessonId = "";
  try {
    const body = await req.json();
    lessonId = String(body.lessonId ?? "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!lessonId) return NextResponse.json({ ok: false }, { status: 400 });

  await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId, completed: true },
      { onConflict: "user_id,lesson_id" }
    );

  return NextResponse.json({ ok: true });
}
