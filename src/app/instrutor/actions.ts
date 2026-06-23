"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function sb() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function path(courseId: string) {
  return `/instrutor/cursos/${courseId}`;
}

// ---------- CURSO ----------
export async function createCourse(formData: FormData) {
  const { supabase, user } = await sb();
  const title = String(formData.get("title") ?? "").trim() || "Novo curso";
  const isFree = formData.get("is_free") === "on";
  const { data, error } = await supabase
    .from("courses")
    .insert({
      instructor_id: user.id,
      title,
      subtitle: String(formData.get("subtitle") ?? "") || null,
      category: String(formData.get("category") ?? "") || null,
      level: String(formData.get("level") ?? "iniciante"),
      is_free: isFree,
      price_cents: isFree ? 0 : Math.round(Number(formData.get("price") ?? 0) * 100),
    })
    .select("id")
    .single();
  if (error || !data) redirect(`/instrutor/cursos/novo?erro=${encodeURIComponent(error?.message ?? "erro")}`);
  redirect(path(data!.id));
}

export async function updateCourseDetails(formData: FormData) {
  const { supabase } = await sb();
  const id = String(formData.get("course_id"));
  const isFree = formData.get("is_free") === "on";
  await supabase
    .from("courses")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      subtitle: String(formData.get("subtitle") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      category: String(formData.get("category") ?? "") || null,
      level: String(formData.get("level") ?? "iniciante"),
      is_free: isFree,
      price_cents: isFree ? 0 : Math.round(Number(formData.get("price") ?? 0) * 100),
    })
    .eq("id", id);
  revalidatePath(path(id));
}

export async function setCourseStatus(formData: FormData) {
  const { supabase } = await sb();
  const id = String(formData.get("course_id"));
  await supabase.from("courses").update({ status: String(formData.get("status")) }).eq("id", id);
  revalidatePath(path(id));
}

export async function deleteCourse(formData: FormData) {
  const { supabase } = await sb();
  const id = String(formData.get("course_id"));
  await supabase.from("courses").delete().eq("id", id);
  redirect("/instrutor");
}

export async function uploadCover(formData: FormData) {
  const { supabase } = await sb();
  const id = String(formData.get("course_id"));
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const key = `${id}/cover-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("course-covers").upload(key, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("course-covers").getPublicUrl(key);
      await supabase.from("courses").update({ cover_url: data.publicUrl }).eq("id", id);
    }
  }
  revalidatePath(path(id));
}

// ---------- MODULOS ----------
export async function createModule(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  const { count } = await supabase
    .from("modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  await supabase.from("modules").insert({
    course_id: courseId,
    title: String(formData.get("title") ?? "").trim() || "Novo módulo",
    position: count ?? 0,
  });
  revalidatePath(path(courseId));
}

export async function renameModule(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  await supabase.from("modules").update({ title: String(formData.get("title") ?? "").trim() }).eq("id", String(formData.get("module_id")));
  revalidatePath(path(courseId));
}

export async function deleteModule(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  await supabase.from("modules").delete().eq("id", String(formData.get("module_id")));
  revalidatePath(path(courseId));
}

async function swapPosition(table: string, parentCol: string, parentId: string, id: string, dir: string) {
  const { supabase } = await sb();
  const { data: items } = await supabase.from(table).select("id, position").eq(parentCol, parentId).order("position");
  if (!items) return;
  const idx = items.findIndex((i: any) => i.id === id);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= items.length) return;
  const a = items[idx] as any;
  const b = items[swap] as any;
  await supabase.from(table).update({ position: b.position }).eq("id", a.id);
  await supabase.from(table).update({ position: a.position }).eq("id", b.id);
}

export async function moveModule(formData: FormData) {
  const courseId = String(formData.get("course_id"));
  await swapPosition("modules", "course_id", courseId, String(formData.get("module_id")), String(formData.get("dir")));
  revalidatePath(path(courseId));
}

// ---------- AULAS ----------
export async function createLesson(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  const moduleId = String(formData.get("module_id"));
  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);
  await supabase.from("lessons").insert({
    module_id: moduleId,
    title: String(formData.get("title") ?? "").trim() || "Nova aula",
    position: count ?? 0,
  });
  revalidatePath(path(courseId));
}

export async function updateLesson(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  await supabase
    .from("lessons")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "") || null,
      vimeo_id: String(formData.get("vimeo_id") ?? "").trim() || null,
      is_preview: formData.get("is_preview") === "on",
    })
    .eq("id", String(formData.get("lesson_id")));
  revalidatePath(path(courseId));
}

export async function deleteLesson(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  await supabase.from("lessons").delete().eq("id", String(formData.get("lesson_id")));
  revalidatePath(path(courseId));
}

export async function moveLesson(formData: FormData) {
  const courseId = String(formData.get("course_id"));
  await swapPosition("lessons", "module_id", String(formData.get("module_id")), String(formData.get("lesson_id")), String(formData.get("dir")));
  revalidatePath(path(courseId));
}

// ---------- MATERIAIS ----------
export async function addMaterial(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  const lessonId = String(formData.get("lesson_id"));
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${lessonId}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from("lesson-materials").upload(key, file, { upsert: false });
    if (!error) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const type = ext === "pdf" ? "pdf" : ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? "imagem" : "outro";
      await supabase.from("materials").insert({
        lesson_id: lessonId,
        name: file.name,
        file_path: key,
        type,
        size_bytes: file.size,
      });
    }
  }
  revalidatePath(path(courseId));
}

export async function deleteMaterial(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  const filePath = String(formData.get("file_path"));
  await supabase.storage.from("lesson-materials").remove([filePath]);
  await supabase.from("materials").delete().eq("id", String(formData.get("material_id")));
  revalidatePath(path(courseId));
}

// ---------- AULAS AO VIVO ----------
export async function createLiveSession(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  const startsAt = String(formData.get("starts_at"));
  await supabase.from("live_sessions").insert({
    course_id: courseId,
    title: String(formData.get("title") ?? "").trim() || "Aula ao vivo",
    description: String(formData.get("description") ?? "") || null,
    starts_at: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
    platform: String(formData.get("platform") ?? "meet"),
    join_url: String(formData.get("join_url") ?? "").trim(),
  });
  revalidatePath(path(courseId));
}

export async function deleteLiveSession(formData: FormData) {
  const { supabase } = await sb();
  const courseId = String(formData.get("course_id"));
  await supabase.from("live_sessions").delete().eq("id", String(formData.get("live_id")));
  revalidatePath(path(courseId));
}
