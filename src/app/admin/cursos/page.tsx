import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAllCoursesAdmin } from "@/lib/admin";
import { STATUS_LABEL } from "@/lib/courses";
import { adminSetCourseStatus, addMapping, deleteMapping } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminCursosPage() {
  await requireRole(["admin"]);
  const courses = await getAllCoursesAdmin();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin" className="text-sm text-brand hover:underline">← Painel</Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Cursos</h1>
          <p className="mt-1 text-sm text-slate-500">Publicação e mapeamento de produtos (Eduzz/Lia) para a venda.</p>
        </div>
        <Link
          href="/instrutor/cursos/novo"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          + Novo curso
        </Link>
      </div>

      {/* Aviso: criação/edição de conteúdo fica no painel do instrutor */}
      <div className="mt-4 rounded-xl border border-brand/30 bg-brand-light px-4 py-3 text-sm text-brand-dark">
        Para <strong>criar</strong> ou <strong>editar o conteúdo</strong> de um curso (capa, módulos, aulas, materiais e vídeos),
        use o <Link href="/instrutor" className="font-medium underline">Painel do instrutor</Link>. Aqui você apenas
        publica/despublica e vincula os produtos de pagamento.
      </div>

      <div className="mt-6 space-y-4">
        {courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            Nenhum curso ainda. Clique em <strong>+ Novo curso</strong> para criar o primeiro.
          </div>
        ) : null}
        {courses.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/cursos/${c.id}`} className="font-semibold text-brand-dark hover:text-brand">{c.title}</Link>
                <p className="text-xs text-slate-400">
                  {c.instructor?.full_name ?? "—"} · {c.is_free ? "Gratuito" : `R$ ${(c.price_cents / 100).toFixed(2)}`} · {STATUS_LABEL[c.status]}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/instrutor/cursos/${c.id}`}
                  className="rounded-lg border border-brand px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand-light"
                >
                  Editar conteúdo
                </Link>
                <form action={adminSetCourseStatus} className="flex items-center gap-2">
                  <input type="hidden" name="course_id" value={c.id} />
                  <select name="status" defaultValue={c.status} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                    <option value="rascunho">Rascunho</option>
                    <option value="em_revisao">Em revisão</option>
                    <option value="publicado">Publicado</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                  <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Salvar</button>
                </form>
              </div>
            </div>

            {/* Mapeamentos */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500">Produtos vinculados (para pagamento)</p>
              <ul className="mt-2 space-y-1">
                {(c.product_mappings ?? []).map((mp: any) => (
                  <li key={mp.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700"><strong className="uppercase">{mp.provider}</strong> · {mp.external_product_id}</span>
                    <form action={deleteMapping}>
                      <input type="hidden" name="mapping_id" value={mp.id} />
                      <button className="text-xs text-red-600 hover:underline">remover</button>
                    </form>
                  </li>
                ))}
                {(c.product_mappings ?? []).length === 0 ? <li className="text-xs text-slate-400">Nenhum produto vinculado.</li> : null}
              </ul>
              <form action={addMapping} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="hidden" name="course_id" value={c.id} />
                <select name="provider" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                  <option value="eduzz">Eduzz</option>
                  <option value="lia">Lia</option>
                </select>
                <input name="external_product_id" placeholder="ID do produto/oferta" className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Vincular</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
