import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getThread } from "@/lib/support";
import { postMessage, setThreadStatus } from "@/app/suporte/actions";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const { user, profile } = await requireUser();
  const data = await getThread(params.id);
  if (!data) redirect("/suporte");
  const { thread, messages } = data;

  const isOwner = thread.user_id === user.id;
  const canModerate = isOwner || profile?.role === "instrutor" || profile?.role === "admin";
  const resolved = thread.status === "resolvida";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/suporte" className="text-sm text-brand hover:underline">← Suporte</Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">{thread.subject}</h1>
          <p className="text-xs text-slate-400">
            {thread.course?.title ? `${thread.course.title} · ` : ""}
            {new Date(thread.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${resolved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {resolved ? "Resolvida" : "Aberta"}
        </span>
      </div>

      {/* Mensagens */}
      <div className="mt-6 space-y-3">
        {messages.map((m: any) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${mine ? "bg-brand text-white" : "bg-slate-100 text-slate-700"}`}>
                <p className={`mb-0.5 text-xs ${mine ? "text-white/70" : "text-slate-400"}`}>{m.sender?.full_name ?? "Usuário"}</p>
                <p className="whitespace-pre-line">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responder / Status */}
      {!resolved ? (
        <div className="mt-6 space-y-3">
          <form action={postMessage}>
            <input type="hidden" name="thread_id" value={thread.id} />
            <textarea name="body" required rows={3} placeholder="Escreva sua resposta..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            <button className="mt-2 rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark">Responder</button>
          </form>
          {canModerate ? (
            <form action={setThreadStatus}>
              <input type="hidden" name="thread_id" value={thread.id} />
              <input type="hidden" name="status" value="resolvida" />
              <button className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50">Marcar como resolvida</button>
            </form>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>Esta dúvida foi marcada como resolvida.</span>
          {canModerate ? (
            <form action={setThreadStatus}>
              <input type="hidden" name="thread_id" value={thread.id} />
              <input type="hidden" name="status" value="aberta" />
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white">Reabrir</button>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
}
