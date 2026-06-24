"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleComplete(formData: FormData) {
  const lessonId = String(formData.get("lesson_id"));
  const courseId = String(formData.get("course_id"));
  const to = formData.get("to") === "true";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId, completed: to },
      { onConflict: "user_id,lesson_id" }
    );

  revalidatePath(`/aprender/${courseId}`);
}
