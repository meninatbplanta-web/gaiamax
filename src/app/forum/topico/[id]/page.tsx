import Link from "next/link";
import { getForumTopic, getForumAuthorsMeta, getReactionsForPosts } from "@/lib/forum";
import { getUserAndProfile } from "@/lib/auth";
import {
  createPost,
  deleteTopic,
  togglePin,
  toggleLock,
  updatePost,
  deletePost,
  toggleReaction,
  reportPost,
} from "@/app/forum/actions";
import { AuthorBadges } from "@/components/author-badges";
import { ForumPager } from "@/components/forum-pager";

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
  searchParams: { erro?: string; page?: string; denunciado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const data = await getForumTopic(params.id, page);
  const { user, profile } = await getUserAndProfile();

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-slate-500">
        Tópico não encontrado.{" "}
        <Link href="/forum" className="text-brand hover:underline">Voltar ao fórum</Link>
      </div>
    );
  }

  const { topic, posts, total, lastPostId, pageSize } = data;
  const meta = await getForumAuthorsMeta(posts.map((p: any) => p.author_id).filter(Boolean));
  const reactions = await getReactionsForPosts(posts.map((p: any) => p.id), user?.id);
  const isAdmin = profile?.role === "admin";
  const hasReplies = total > 1;
  const isOwnerTopic = !!user && user.id === topic.author_id;
  const canDeleteTopic = isAdmin || (isOwnerTopic && !hasReplies);

  const btn =
    "rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";

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

      {(isAdmin || canDeleteTopic) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {isAdmin ? (
            <>
              <form action={togglePin}>
                <input type="hidden" name="topic_id" value={topic.id} />
                <input type="hidden" name="pinned" value={topic.is_pinned ? "1" : "0"} />
                <button className={btn}>{topic.is_pinned ? "Desafixar" : "Fixar"}</button>
              </form>
              <form action={toggleLock}>
                <input type="hidden" name="topic_id" value={topic.id} />
                <input type="hidden" name="locked" value={topic.is_locked ? "1" : "0"} />
                <button className={btn}>{topic.is_locked ? "Destrancar" : "Trancar"}</button>
              </form>
            </>
          ) : null}
          {canDeleteTopic ? (
            <form action={deleteTopic}>
              <input type="hidden" name="topic_id" value={topic.id} />
              <input type="hidden" name="slug" value={topic.category?.slug ?? ""} />
              <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                Excluir tópico
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {searchParams.denunciado ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Denúncia enviada. Nossa equipe vai analisar. Obrigado!
        </p>
      ) : null}
      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.erro}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {posts.map((p: any, idx: number) => {
          const am = p.author_id ? meta.get(p.author_id) : undefined;
          const authorName = p.author_id ? (am?.full_name ?? p.author?.full_name ?? "Usuário") : "Membro da comunidade";
          const isOpening = page === 1 && idx === 0;
          const isLast = p.id === lastPostId;
          const isOwnPost = !!user && p.author_id === user.id;
          const authorCanEdit = isOwnPost && isLast;
          const authorCanDelete = authorCanEdit && !isOpening;
          const showEdit = authorCanEdit || isAdmin;
          const showDelete = authorCanDelete || isAdmin;
          const editado = p.updated_at && p.updated_at !== p.created_at;
          const rx = reactions.get(p.id) ?? { count: 0, mine: false };
          const lockedForOwner = isOwnPost && !isLast && !isAdmin;
          return (
            <div key={p.id} className="rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-800">{authorName}</span>
                  <AuthorBadges meta={am} />
                </span>
                <span className="text-xs text-slate-400">
                  {dataHora(p.created_at)}{editado ? " · editado" : ""}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-slate-700">{p.body}</p>

              <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs">
                {/* Curtir */}
                {user ? (
                  <form action={toggleReaction}>
                    <input type="hidden" name="post_id" value={p.id} />
                    <input type="hidden" name="topic_id" value={topic.id} />
                    <button
                      className={
                        rx.mine
                          ? "rounded-full bg-brand px-3 py-1 font-medium text-white"
                          : "rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-600 hover:bg-slate-50"
                      }
                    >
                      ♥ Curtir{rx.count > 0 ? ` · ${rx.count}` : ""}
                    </button>
                  </form>
                ) : (
                  <span className="text-slate-400">♥ {rx.count}</span>
                )}

                {showEdit ? (
                  <details>
                    <summary className="cursor-pointer font-medium text-brand">Editar</summary>
                    <form action={updatePost} className="mt-2 space-y-2">
                      <input type="hidden" name="post_id" value={p.id} />
                      <input type="hidden" name="topic_id" value={topic.id} />
                      <textarea
                        name="body"
                        required
                        rows={4}
                        defaultValue={p.body}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
                      />
                      <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark">
                        Salvar edição
                      </button>
                    </form>
                  </details>
                ) : null}

                {showDelete ? (
                  <form action={deletePost}>
                    <input type="hidden" name="post_id" value={p.id} />
                    <input type="hidden" name="topic_id" value={topic.id} />
                    <button className="font-medium text-red-600 hover:underline">Excluir</button>
                  </form>
                ) : null}

                {/* Denunciar (qualquer usuário logado que não seja o autor) */}
                {user && p.author_id && user.id !== p.author_id ? (
                  <details>
                    <summary className="cursor-pointer text-slate-400 hover:text-slate-600">Denunciar</summary>
                    <form action={reportPost} className="mt-2 space-y-2">
                      <input type="hidden" name="post_id" value={p.id} />
                      <input type="hidden" name="topic_id" value={topic.id} />
                      <input
                        name="reason"
                        type="text"
                        placeholder="Motivo (opcional)"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
                      />
                      <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        Enviar denúncia
                      </button>
                    </form>
                  </details>
                ) : null}

                {lockedForOwner ? (
                  <span className="text-slate-400">
                    Já recebeu respostas — só o administrador pode editar ou excluir.
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <ForumPager basePath={`/forum/topico/${topic.id}`} page={page} total={total} pageSize={pageSize} />

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
