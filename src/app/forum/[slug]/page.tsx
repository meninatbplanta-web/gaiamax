import Link from "next/link";
import { getForumCategory, getForumAuthorsMeta } from "@/lib/forum";
import { getUserAndProfile } from "@/lib/auth";
import { AuthorBadges } from "@/components/author-badges";

export const dynamic = "force-dynamic";

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function ForumCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getForumCategory(params.slug);
  const { user } = await getUserAndProfile();

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-slate-500">
        Área não encontrada.{" "}
        <Link href="/forum" className="text-brand hover:underline">Voltar ao fórum</Link>
      </div>
    );
  }

  const { category, topics } = data;
  const meta = await getForumAuthorsMeta(topics.map((t: any) => t.author_id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/forum" className="text-sm text-brand hover:underline">← Fórum</Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{category.name}</h1>
          {category.description ? <p className="mt-1 text-sm text-slate-500">{category.description}</p> : null}
        </div>
        {user ? (
          <Link
            href={`/forum/${category.slug}/novo`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Novo tópico
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
          >
            Entrar para participar
          </Link>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {topics.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum tópico ainda. Seja o primeiro a abrir uma conversa.</p>
        ) : (
          topics.map((t: any) => {
            const msgs = t.posts?.[0]?.count ?? 0;
            const am = meta.get(t.author_id);
            return (
              <Link
                key={t.id}
                href={`/forum/topico/${t.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-medium text-slate-800">
                    {t.is_pinned ? <span className="rounded bg-brand-light px-1.5 py-0.5 text-xs text-brand">fixado</span> : null}
                    {t.is_locked ? <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">trancado</span> : null}
                    {t.title}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    por {am?.full_name ?? t.author?.full_name ?? "Usuário"}
                    <AuthorBadges meta={am} />
                    <span>· {dataCurta(t.updated_at)}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{msgs} msg</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
