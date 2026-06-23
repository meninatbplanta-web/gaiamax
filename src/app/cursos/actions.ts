"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function enrollFree(formData: FormData) {
  const courseId = String(formData.get("course_id"));
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login`);

  // Confirma que o curso é gratuito e publicado
  const { data: course } = await supabase
    .from("courses")
    .select("id, is_free, status")
    .eq("id", courseId)
    .single();
  if (!course || !course.is_free || course.status !== "publicado") {
    redirect(`/cursos/${courseId}`);
  }

  // Cria a matrícula (ignora se já existir)
  await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id: courseId, source: "gratuito" });

  redirect(`/cursos/${courseId}?inscrito=1`);
}
