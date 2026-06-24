import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getEnrolledCourses, LEVEL_LABEL } from "@/lib/courses";

export const dynamic = "force-dynamic";

export default async function MeusCursosPage() {
  await requireUser();
  const courses = await getEnrolledCourses();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-dark">Meus cursos</h1>
      <p className="mt-1 text-sm text-slate-500">Continue de onde parou.</p>

      {courses.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Você ainda não está inscrito em nenhum curso.{" "}
          <Link href="/cursos" className="text-brand hover:underline">Ver catálogo</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/aprender/${c.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 transition hover:shadow-md"
            >
              <div className="aspect-video w-full bg-brand-light">
                {c.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-brand/40">GaiaMax</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-brand-dark group-hover:text-brand">{c.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{LEVEL_LABEL[c.level]}</p>
                <span className="mt-auto pt-3 text-sm font-medium text-brand">Continuar →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
