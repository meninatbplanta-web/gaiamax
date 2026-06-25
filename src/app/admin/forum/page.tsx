import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getForumCategories } from "@/lib/forum";
import { addForumCategory, deleteForumCategory } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminForumPage() {
  await requireRole(["admin"]);
  const categorias = await getForumCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin" className="text-sm text-brand hover:underline">← Painel</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-dark">Áreas do fórum</h1>
      <p className="mt-1 text-sm text-slate-500">{categorias.length} área(s). Os usuários abrem tópicos dentro delas.</p>

      <Link href="/admin/forum/denuncias" className="mt-3 inline-block rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50">
        Ver denúncias
      </Link>

      <div className="mt-6 space-y-2">
        {categorias.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-800">
                {c.name} <span className="text-xs text-slate-400">/{c.slug}</span>
              </p>
              {c.description ? <p className="truncate text-xs text-slate-500">{c.description}</p> : null}
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/forum/${c.slug}`} className="text-xs text-brand hover:underline">ver</Link>
              <form action={deleteForumCategory}>
                <input type="hidden" name="category_id" value={c.id} />
                <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                  Excluir
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Nova área</h2>
        <form action={addForumCategory} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome</label>
            <input
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Descrição (opcional)</label>
            <input
              name="description"
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Posição</label>
            <input
              name="position"
              type="number"
              defaultValue={categorias.length + 1}
              className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Criar área
          </button>
        </form>
      </div>
    </div>
  );
}
