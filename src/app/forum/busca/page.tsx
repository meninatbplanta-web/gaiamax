import Link from "next/link";
import { searchForum } from "@/lib/forum";

export const dynamic = "force-dynamic";

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const resultados = q ? await searchForum(q) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/forum" className="text-sm text-brand hover:underline">← Fórum</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-dark">Busca no fórum</h1>

      <form action="/forum/busca" method="get" className="mt-4 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar no fórum…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Buscar
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {!q ? (
          <p className="text-sm text-slate-400">Digite um termo para buscar tópicos por título ou conteúdo.</p>
        ) : resultados.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum resultado para “{q}”.</p>
        ) : (
          resultados.map((t: any) => (
            <Link
              key={t.id}
              href={`/forum/topico/${t.id}`}
              className="block rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand"
            >
              <p className="font-medium text-slate-800">{t.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {t.category?.name ?? "Fórum"} · {dataCurta(t.updated_at)}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
