import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getOpenForumReports } from "@/lib/forum";
import { resolveReport, deleteReportedPost } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDenunciasPage() {
  await requireRole(["admin"]);
  const reports = await getOpenForumReports();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin/forum" className="text-sm text-brand hover:underline">← Fórum</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-dark">Denúncias do fórum</h1>
      <p className="mt-1 text-sm text-slate-500">{reports.length} denúncia(s) aberta(s).</p>

      <div className="mt-6 space-y-3">
        {reports.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma denúncia pendente.</p>
        ) : (
          reports.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-400">{dataHora(r.created_at)}</p>
              {r.reason ? (
                <p className="mt-1 text-sm text-slate-600"><strong>Motivo:</strong> {r.reason}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Sem motivo informado.</p>
              )}
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {r.post?.body ? (
                  <p className="whitespace-pre-line line-clamp-4">{r.post.body}</p>
                ) : (
                  <p className="text-slate-400">(post removido)</p>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {r.post?.topic_id ? (
                  <Link href={`/forum/topico/${r.post.topic_id}`} className="text-xs text-brand hover:underline">
                    Ver no fórum
                  </Link>
                ) : null}
                <form action={resolveReport}>
                  <input type="hidden" name="report_id" value={r.id} />
                  <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    Marcar resolvida
                  </button>
                </form>
                {r.post?.id ? (
                  <form action={deleteReportedPost}>
                    <input type="hidden" name="post_id" value={r.post.id} />
                    <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      Excluir post
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
