import Link from "next/link";
import { getForumCategory } from "@/lib/forum";
import { requireUser } from "@/lib/auth";
import { createTopic } from "@/app/forum/actions";

export const dynamic = "force-dynamic";

export default async function NovoTopicoPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { erro?: string };
}) {
  await requireUser();
  const data = await getForumCategory(params.slug);

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-slate-500">
        Área não encontrada.{" "}
        <Link href="/forum" className="text-brand hover:underline">Voltar ao fórum</Link>
      </div>
    );
  }

  const { category } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href={`/forum/${category.slug}`} className="text-sm text-brand hover:underline">← {category.name}</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-dark">Novo tópico</h1>
      <p className="mt-1 text-sm text-slate-500">Em {category.name}</p>

      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.erro}</p>
      ) : null}

      <form action={createTopic} className="mt-6 space-y-4">
        <input type="hidden" name="category_id" value={category.id} />
        <input type="hidden" name="slug" value={category.slug} />
        <div>
          <label className="block text-sm font-medium text-slate-700">Título</label>
          <input
            name="title"
            type="text"
            required
            maxLength={140}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mensagem</label>
          <textarea
            name="body"
            required
            rows={8}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <button className="rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark">
          Publicar tópico
        </button>
      </form>
    </div>
  );
}
