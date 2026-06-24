import Link from "next/link";
import { redirect } from "next/navigation";
import { getLearnCourse } from "@/lib/courses";
import { VimeoPlayer } from "@/components/vimeo-player";

export const dynamic = "force-dynamic";

export default async function AprenderPage({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams: { aula?: string };
}) {
  const { course, allowed } = await getLearnCourse(params.courseId);
  if (!course) redirect("/meus-cursos");
  if (!allowed) redirect(`/cursos/${params.courseId}`);

  // Lista linear de aulas (na ordem do currículo)
  const lessons: any[] = [];
  for (const m of course.modules) {
    for (const l of m.lessons) lessons.push({ ...l, moduleTitle: m.title });
  }
  const current =
    lessons.find((l) => l.id === searchParams.aula) ?? lessons[0] ?? null;

  const proximas = (course.live_sessions ?? []).filter(
    (s: any) => new Date(s.starts_at).getTime() > Date.now() - 2 * 3600 * 1000
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/meus-cursos" className="text-sm text-brand hover:underline">← Meus cursos</Link>
      <h1 className="mt-2 text-xl font-bold text-brand-dark">{course.title}</h1>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          {current ? (
            <>
              <VimeoPlayer value={current.vimeo_id} title={current.title} />
              <h2 className="mt-4 text-lg font-semibold text-brand-dark">{current.title}</h2>
              {current.description ? (
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{current.description}</p>
              ) : null}

              {/* Materiais da aula */}
              {(current.materials ?? []).length > 0 ? (
                <div className="mt-6 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-brand-dark">Materiais de apoio</p>
                  <ul className="mt-2 space-y-1.5">
                    {current.materials.map((mat: any) => (
                      <li key={mat.id}>
                        <a
                          href={`/api/materiais/${mat.id}`}
                          className="text-sm text-brand hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📎 {mat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              Este curso ainda não tem aulas publicadas.
            </div>
          )}

          {/* Aulas ao vivo */}
          {proximas.length > 0 ? (
            <div className="mt-6 rounded-xl border border-brand/30 bg-brand-light/40 p-4">
              <p className="text-sm font-semibold text-brand-dark">Aulas ao vivo</p>
              <ul className="mt-2 space-y-2">
                {proximas.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-700">{s.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.starts_at).toLocaleString("pt-BR")} · {s.platform === "zoom" ? "Zoom" : "Google Meet"}
                      </p>
                    </div>
                    <a
                      href={s.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
                    >
                      Entrar
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Sidebar currículo */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-brand-dark">
              Conteúdo do curso
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {course.modules.map((m: any, mi: number) => (
                <div key={m.id} className="mb-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Módulo {mi + 1}: {m.title}
                  </p>
                  <ul>
                    {m.lessons.map((l: any) => {
                      const active = current && l.id === current.id;
                      return (
                        <li key={l.id}>
                          <Link
                            href={`/aprender/${course.id}?aula=${l.id}`}
                            className={`block rounded-lg px-3 py-2 text-sm ${
                              active ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {l.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
