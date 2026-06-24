import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getVisibleThreads } from "@/lib/support";
import { getEnrolledCourses } from "@/lib/courses";
import { createThread } from "@/app/suporte/actions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const resolved = status === "resolvida";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${resolved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
      {resolved ? "Resolvida" : "Aberta"}
    </span>
  );
}

export default async function SuportePage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  const { user } = await requireUser();
  const [threads, enrolled] = await Promise.all([getVisibleThreads(), getEnrolledCourses()]);
  const minhas = threads.filter((t) => t.user_id === user.id);
  const paraResponder = threads.filter((t) => t.user_id !== user.id);

  const Item = ({ t }: { t: any }) => (
    <Link href={`/suporte/${t.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:shadow-sm">
      <div>
        <p className="font-medium text-brand-dark">{t.subject}</p>
        <p className="text-xs text-slate-400">
          {t.course?.title ? `${t.course.title} · ` : ""}
          {new Date(t.updated_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <StatusBadge status={t.status} />
    </Link>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-dark">Suporte</h1>
      <p className="mt-1 text-sm text-slate-500">Tire suas dúvidas com a equipe e os instrutores.</p>

      {/* Nova dúvida */}
      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-brand-dark">Abrir nova dúvida</h2>
        {searchParams.erro ? (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Preencha o assunto e a mensagem.</p>
        ) : null}
        <form action={createThread} className="mt-3 space-y-3">
          <input name="subject" required placeholder="Assunto" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          <select name="course_id" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">Dúvida geral (sem curso)</option>
            {enrolled.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <textarea name="body" required rows={4} placeholder="Descreva sua dúvida..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          <button className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">Enviar dúvida</button>
        </form>
      </div>

      {/* Minhas dúvidas */}
      <h2 className="mt-10 font-semibold text-brand-dark">Minhas dúvidas</h2>
      {minhas.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">Você ainda não abriu nenhuma dúvida.</p>
      ) : (
        <div className="mt-3 space-y-2">{minhas.map((t) => <Item key={t.id} t={t} />)}</div>
      )}

      {/* Para responder (instrutor/admin) */}
      {paraResponder.length > 0 ? (
        <>
          <h2 className="mt-10 font-semibold text-brand-dark">Dúvidas para responder</h2>
          <div className="mt-3 space-y-2">{paraResponder.map((t) => <Item key={t.id} t={t} />)}</div>
        </>
      ) : null}
    </div>
  );
}
