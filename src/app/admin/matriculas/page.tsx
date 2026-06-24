import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAllEnrollments, getAllCoursesAdmin, getAllPayments } from "@/lib/admin";
import { revokeEnrollment, grantEnrollment } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminMatriculasPage() {
  await requireRole(["admin"]);
  const [enrollments, courses, payments] = await Promise.all([
    getAllEnrollments(),
    getAllCoursesAdmin(),
    getAllPayments(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin" className="text-sm text-brand hover:underline">← Painel</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-dark">Matrículas</h1>

      {/* Conceder acesso manual */}
      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <p className="font-semibold text-brand-dark">Conceder acesso manualmente</p>
        <p className="mt-1 text-xs text-slate-500">Útil como contingência de pagamento ou cortesia.</p>
        <form action={grantEnrollment} className="mt-3 flex flex-wrap items-end gap-2">
          <input name="email" type="email" required placeholder="E-mail do aluno" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select name="course_id" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Curso...</option>
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">Conceder</button>
        </form>
      </div>

      {/* Lista de matrículas */}
      <h2 className="mt-8 font-semibold text-brand-dark">Matrículas ({enrollments.length})</h2>
      <div className="mt-3 space-y-2">
        {enrollments.map((e: any) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-800">{e.user?.full_name ?? "(aluno)"} — {e.course?.title ?? "(curso)"}</p>
              <p className="text-xs text-slate-400">Origem: {e.source} · {new Date(e.created_at).toLocaleDateString("pt-BR")} · {e.status}</p>
            </div>
            <form action={revokeEnrollment}>
              <input type="hidden" name="enrollment_id" value={e.id} />
              <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Revogar</button>
            </form>
          </div>
        ))}
        {enrollments.length === 0 ? <p className="text-sm text-slate-400">Nenhuma matrícula ainda.</p> : null}
      </div>

      {/* Pagamentos */}
      <h2 className="mt-8 font-semibold text-brand-dark">Pagamentos ({payments.length})</h2>
      {payments.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">Nenhum pagamento registrado (chega na Fase 9, com Eduzz/Lia).</p>
      ) : (
        <div className="mt-3 space-y-2">
          {payments.map((p: any) => (
            <div key={p.id} className="rounded-lg border border-slate-200 px-4 py-3 text-sm">
              <p className="text-slate-700"><strong className="uppercase">{p.provider}</strong> · {p.status} · {p.event}</p>
              <p className="text-xs text-slate-400">{p.external_id} · {new Date(p.created_at).toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
