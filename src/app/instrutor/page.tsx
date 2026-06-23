import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getMyCourses, STATUS_LABEL, LEVEL_LABEL } from "@/lib/courses";

const STATUS_COLOR: Record<string, string> = {
  rascunho: "bg-slate-100 text-slate-600",
  em_revisao: "bg-amber-100 text-amber-700",
  publicado: "bg-green-100 text-green-700",
  arquivado: "bg-slate-200 text-slate-500",
};

export default async function InstrutorPage() {
  const { profile } = await requireRole(["instrutor", "admin"]);
  const courses = await getMyCourses();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Meus cursos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Olá, {profile?.full_name ?? "instrutor"}. Crie e gerencie suas formações.
          </p>
        </div>
        <Link
          href="/instrutor/cursos/novo"
          className="rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark"
        >
          + Novo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Você ainda não tem cursos. Clique em <strong>Novo curso</strong> para começar.
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/instrutor/cursos/${c.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:shadow-md"
            >
              <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-light">
                {c.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.cover_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">{c.title}</p>
                <p className="text-xs text-slate-500">
                  {LEVEL_LABEL[c.level]} · {c.is_free ? "Gratuito" : `R$ ${(c.price_cents / 100).toFixed(2)}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[c.status]}`}>
                {STATUS_LABEL[c.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
