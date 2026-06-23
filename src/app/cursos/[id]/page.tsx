import Link from "next/link";
import { getPublicCourse, LEVEL_LABEL } from "@/lib/courses";
import { createClient } from "@/lib/supabase/server";
import { enrollFree } from "@/app/cursos/actions";

export const dynamic = "force-dynamic";

export default async function CursoDetalhePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { inscrito?: string };
}) {
  const course = await getPublicCourse(params.id);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-slate-500">
        Curso não encontrado ou ainda não publicado.{" "}
        <Link href="/cursos" className="text-brand hover:underline">Ver catálogo</Link>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let enrolled = false;
  if (user) {
    const { data } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    enrolled = !!data;
  }

  const totalAulas = course.modules.reduce(
    (n: number, m: any) => n + (m.lessons?.length ?? 0),
    0
  );
  const instrutor = course.instructor?.full_name ?? "Instrutor GaiaMax";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/cursos" className="text-sm text-brand hover:underline">← Catálogo</Link>

      {searchParams.inscrito ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Inscrição confirmada! Em breve seus cursos aparecerão na sua área de aluno.
        </p>
      ) : null}

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        {/* Conteúdo */}
        <div className="lg:col-span-2">
          {course.category ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand">{course.category}</span>
          ) : null}
          <h1 className="mt-1 text-3xl font-bold text-brand-dark">{course.title}</h1>
          {course.subtitle ? <p className="mt-2 text-lg text-slate-600">{course.subtitle}</p> : null}
          <p className="mt-3 text-sm text-slate-500">
            Por <strong className="text-slate-700">{instrutor}</strong> · {LEVEL_LABEL[course.level]} · {totalAulas} aula(s)
          </p>

          {course.description ? (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-brand-dark">Sobre o curso</h2>
              <p className="mt-2 whitespace-pre-line text-slate-600">{course.description}</p>
            </div>
          ) : null}

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-brand-dark">Conteúdo do curso</h2>
            <div className="mt-3 space-y-3">
              {course.modules.length === 0 ? (
                <p className="text-sm text-slate-400">O conteúdo será disponibilizado em breve.</p>
              ) : (
                course.modules.map((m: any, mi: number) => (
                  <div key={m.id} className="rounded-xl border border-slate-200">
                    <div className="border-b border-slate-100 px-4 py-3 font-medium text-brand-dark">
                      Módulo {mi + 1}: {m.title}
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {(m.lessons ?? []).map((l: any) => (
                        <li key={l.id} className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-600">
                          <span>▸ {l.title}</span>
                          {l.is_preview ? (
                            <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">prévia</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card lateral */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="aspect-video w-full bg-brand-light">
              {course.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.cover_url} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-5">
              <p className="text-2xl font-bold text-brand-dark">
                {course.is_free ? "Gratuito" : `R$ ${(course.price_cents / 100).toFixed(2)}`}
              </p>

              <div className="mt-4">
                {enrolled ? (
                  <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                    Você já está inscrito ✓
                  </div>
                ) : !user ? (
                  <Link href="/login" className="block rounded-lg bg-brand px-4 py-3 text-center font-medium text-white hover:bg-brand-dark">
                    Entrar para se inscrever
                  </Link>
                ) : course.is_free ? (
                  <form action={enrollFree}>
                    <input type="hidden" name="course_id" value={course.id} />
                    <button className="w-full rounded-lg bg-brand px-4 py-3 font-medium text-white hover:bg-brand-dark">
                      Inscrever-se gratuitamente
                    </button>
                  </form>
                ) : (
                  <div>
                    <button disabled className="w-full cursor-not-allowed rounded-lg bg-slate-200 px-4 py-3 font-medium text-slate-500">
                      Comprar
                    </button>
                    <p className="mt-2 text-center text-xs text-slate-400">Pagamentos disponíveis em breve.</p>
                  </div>
                )}
              </div>

              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Instrutor</dt><dd className="font-medium text-slate-700">{instrutor}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Nível</dt><dd className="font-medium text-slate-700">{LEVEL_LABEL[course.level]}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Aulas</dt><dd className="font-medium text-slate-700">{totalAulas}</dd></div>
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
