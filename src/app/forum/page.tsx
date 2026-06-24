import Link from "next/link";
import { getForumCategories } from "@/lib/forum";

export const dynamic = "force-dynamic";

export default async function ForumHomePage() {
  const categorias = await getForumCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-dark">Fórum da comunidade</h1>
      <p className="mt-1 text-sm text-slate-500">
        Um espaço aberto para trocar experiências. Qualquer pessoa pode ler; para participar, basta ter uma conta.
      </p>

      <div className="mt-6 space-y-3">
        {categorias.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma área disponível ainda.</p>
        ) : (
          categorias.map((c) => (
            <Link
              key={c.id}
              href={`/forum/${c.slug}`}
              className="block rounded-xl border border-slate-200 p-5 transition hover:border-brand hover:bg-brand-light"
            >
              <h2 className="text-lg font-semibold text-brand-dark">{c.name}</h2>
              {c.description ? <p className="mt-1 text-sm text-slate-500">{c.description}</p> : null}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
