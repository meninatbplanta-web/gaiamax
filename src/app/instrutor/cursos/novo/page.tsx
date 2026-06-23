import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createCourse } from "@/app/instrutor/actions";

export default async function NovoCursoPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  await requireRole(["instrutor", "admin"]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/instrutor" className="text-sm text-brand hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-dark">Novo curso</h1>
      <p className="mt-1 text-sm text-slate-500">
        Comece com o básico. Você adiciona módulos, aulas e materiais na próxima tela.
      </p>

      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.erro}</p>
      ) : null}

      <form action={createCourse} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Título</label>
          <input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Subtítulo</label>
          <input name="subtitle" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Categoria / tema</label>
            <input name="category" placeholder="Mesa radiônica, limpeza energética..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nível</label>
            <select name="level" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand">
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
          <input id="is_free" name="is_free" type="checkbox" defaultChecked className="h-4 w-4" />
          <label htmlFor="is_free" className="text-sm text-slate-700">Curso gratuito</label>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-slate-500">Preço (R$)</span>
            <input name="price" type="number" min="0" step="0.01" defaultValue="0" className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 outline-none focus:border-brand" />
          </div>
        </div>
        <button className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-dark">
          Criar curso
        </button>
      </form>
    </div>
  );
}
