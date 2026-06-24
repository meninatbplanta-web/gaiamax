import Link from "next/link";
import { getForumTopic } from "@/lib/forum";
import { getUserAndProfile } from "@/lib/auth";
import { createPost } from "@/app/forum/actions";

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

export default async function TopicoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { erro?: string };
}) {
  const data = await getForumTopic(params.id);
  const { user } = await getUserAndProfile();

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-slate-500">
        Tópico não encontrado.{" "}
        <Link href="/forum" className="text-brand hover:underline">Voltar ao fórum</Link>
      </div>
    );
  }

  const { topic, posts } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href={`/forum/${topic.category?.slug ?? ""}`} className="text-sm text-brand hover:underline">
        ← {topic.category?.name ?? "Fórum"}
      </Link>

      <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-bold text-brand-dark">
        {topic.is_pinned ? <span className="rounded bg-brand-light px-2 py-0.5 text-xs text-brand">fixado</span> : null}
        {topic.is_locked ? <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">trancado</span> : null}
        {topic.title}
      </h1>

      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.erro}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{p.author?.full_name ?? "Usuário"}</span>
              <span className="text-xs text-slate-400">{dataHora(p.created_at)}</span>
            </div>
            <p className="mt-3 whitespace-pre-line text-slate-700">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {topic.is_locked ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Este tópico está trancado para novas respostas.
          </p>
        ) : user ? (
          <form action={createPost} className="space-y-3">
            <input type="hidden" name="topic_id" value={topic.id} />
            <label className="block text-sm font-medium text-slate-700">Sua resposta</label>
            <textarea
              name="body"
              required
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
              placeholder="Escreva sua resposta…"
            />
            <button className="rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark">
              Responder
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="inline-block rounded-lg border border-brand px-4 py-2.5 text-sm font-medium text-brand hover:bg-brand-light"
          >
            Entrar para responder
          </Link>
        )}
      </div>
    </div>
  );
}
