import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getCourseTree, STATUS_LABEL } from "@/lib/courses";
import { VimeoPlayer } from "@/components/vimeo-player";
import {
  updateCourseDetails, setCourseStatus, deleteCourse, uploadCover,
  createModule, renameModule, deleteModule, moveModule,
  createLesson, updateLesson, deleteLesson, moveLesson,
  addMaterial, deleteMaterial,
  createLiveSession, deleteLiveSession,
} from "@/app/instrutor/actions";

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand";
const btn = "rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-dark";
const btnGhost = "rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";

export default async function EditorCursoPage({ params }: { params: { id: string } }) {
  await requireRole(["instrutor", "admin"]);
  const course = await getCourseTree(params.id);
  if (!course) redirect("/instrutor");
  const cid = course.id as string;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/instrutor" className="text-sm text-brand hover:underline">← Meus cursos</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">{course.title}</h1>
        <div className="flex items-center gap-2">
          <form action={setCourseStatus} className="flex items-center gap-2">
            <input type="hidden" name="course_id" value={cid} />
            <select name="status" defaultValue={course.status} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
              <option value="rascunho">Rascunho</option>
              <option value="em_revisao">Em revisão</option>
              <option value="publicado">Publicado</option>
              <option value="arquivado">Arquivado</option>
            </select>
            <button className={btnGhost}>Salvar status</button>
          </form>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400">Status atual: {STATUS_LABEL[course.status]}</p>

      {/* DETALHES */}
      <section className="mt-8 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Detalhes do curso</h2>
        <form action={updateCourseDetails} className="mt-4 space-y-4">
          <input type="hidden" name="course_id" value={cid} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Título</label>
              <input name="title" defaultValue={course.title} required className={`mt-1 ${input}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Subtítulo</label>
              <input name="subtitle" defaultValue={course.subtitle ?? ""} className={`mt-1 ${input}`} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <textarea name="description" defaultValue={course.description ?? ""} rows={4} className={`mt-1 ${input}`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Categoria / tema</label>
              <input name="category" defaultValue={course.category ?? ""} className={`mt-1 ${input}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nível</label>
              <select name="level" defaultValue={course.level} className={`mt-1 ${input}`}>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <input id="is_free" name="is_free" type="checkbox" defaultChecked={course.is_free} className="h-4 w-4" />
            <label htmlFor="is_free" className="text-sm text-slate-700">Gratuito</label>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-slate-500">Preço (R$)</span>
              <input name="price" type="number" min="0" step="0.01" defaultValue={(course.price_cents / 100).toFixed(2)} className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
          </div>
          <button className={btn}>Salvar detalhes</button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <label className="text-sm font-medium text-slate-700">Imagem de capa</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-16 w-28 overflow-hidden rounded-lg bg-brand-light">
              {course.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.cover_url} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <form action={uploadCover} className="flex items-center gap-2">
              <input type="hidden" name="course_id" value={cid} />
              <input type="file" name="file" accept="image/*" className="text-sm" />
              <button className={btnGhost}>Enviar capa</button>
            </form>
          </div>
        </div>
      </section>

      {/* CURRICULO */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-brand-dark">Currículo</h2>
        <div className="mt-4 space-y-5">
          {course.modules.map((m: any, mi: number) => (
            <div key={m.id} className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <form action={renameModule} className="flex flex-1 items-center gap-2">
                  <input type="hidden" name="course_id" value={cid} />
                  <input type="hidden" name="module_id" value={m.id} />
                  <span className="text-xs font-semibold text-slate-400">Módulo {mi + 1}</span>
                  <input name="title" defaultValue={m.title} className={`${input} font-medium`} />
                  <button className={btnGhost}>Salvar</button>
                </form>
                <form action={moveModule}>
                  <input type="hidden" name="course_id" value={cid} />
                  <input type="hidden" name="module_id" value={m.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button className={btnGhost} aria-label="Subir">↑</button>
                </form>
                <form action={moveModule}>
                  <input type="hidden" name="course_id" value={cid} />
                  <input type="hidden" name="module_id" value={m.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button className={btnGhost} aria-label="Descer">↓</button>
                </form>
                <form action={deleteModule}>
                  <input type="hidden" name="course_id" value={cid} />
                  <input type="hidden" name="module_id" value={m.id} />
                  <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Excluir</button>
                </form>
              </div>

              {/* AULAS */}
              <div className="mt-4 space-y-3 pl-2">
                {m.lessons.map((l: any, li: number) => (
                  <details key={l.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <summary className="cursor-pointer text-sm font-medium text-slate-700">
                      Aula {li + 1}: {l.title}{l.is_preview ? " · (prévia)" : ""}
                    </summary>
                    <form action={updateLesson} className="mt-3 space-y-3">
                      <input type="hidden" name="course_id" value={cid} />
                      <input type="hidden" name="lesson_id" value={l.id} />
                      <input name="title" defaultValue={l.title} className={input} />
                      <textarea name="description" defaultValue={l.description ?? ""} rows={2} placeholder="Descrição da aula" className={input} />
                      <input name="vimeo_id" defaultValue={l.vimeo_id ?? ""} placeholder="ID ou link do vídeo no Vimeo (ex.: https://vimeo.com/123456789/abc123)" className={input} />
                      {l.vimeo_id ? (
                        <div className="mt-2">
                          <VimeoPlayer value={l.vimeo_id} title={l.title} />
                        </div>
                      ) : null}
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" name="is_preview" defaultChecked={l.is_preview} className="h-4 w-4" />
                        Aula de pré-visualização (free preview)
                      </label>
                      <div className="flex items-center gap-2">
                        <button className={btn}>Salvar aula</button>
                        <span className="ml-auto" />
                      </div>
                    </form>

                    {/* MATERIAIS */}
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <p className="text-xs font-semibold text-slate-500">Materiais de apoio</p>
                      <ul className="mt-2 space-y-1">
                        {(l.materials ?? []).map((mat: any) => (
                          <li key={mat.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">📎 {mat.name} <span className="text-xs text-slate-400">({mat.type})</span></span>
                            <form action={deleteMaterial}>
                              <input type="hidden" name="course_id" value={cid} />
                              <input type="hidden" name="material_id" value={mat.id} />
                              <input type="hidden" name="file_path" value={mat.file_path} />
                              <button className="text-xs text-red-600 hover:underline">remover</button>
                            </form>
                          </li>
                        ))}
                      </ul>
                      <form action={addMaterial} className="mt-2 flex items-center gap-2">
                        <input type="hidden" name="course_id" value={cid} />
                        <input type="hidden" name="lesson_id" value={l.id} />
                        <input type="file" name="file" className="text-xs" />
                        <button className={btnGhost}>Adicionar material</button>
                      </form>
                    </div>

                    <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
                      <form action={moveLesson}>
                        <input type="hidden" name="course_id" value={cid} />
                        <input type="hidden" name="module_id" value={m.id} />
                        <input type="hidden" name="lesson_id" value={l.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button className={btnGhost}>↑</button>
                      </form>
                      <form action={moveLesson}>
                        <input type="hidden" name="course_id" value={cid} />
                        <input type="hidden" name="module_id" value={m.id} />
                        <input type="hidden" name="lesson_id" value={l.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button className={btnGhost}>↓</button>
                      </form>
                      <form action={deleteLesson}>
                        <input type="hidden" name="course_id" value={cid} />
                        <input type="hidden" name="lesson_id" value={l.id} />
                        <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Excluir aula</button>
                      </form>
                    </div>
                  </details>
                ))}

                <form action={createLesson} className="flex items-center gap-2">
                  <input type="hidden" name="course_id" value={cid} />
                  <input type="hidden" name="module_id" value={m.id} />
                  <input name="title" placeholder="Título da nova aula" className={input} />
                  <button className={btnGhost}>+ Aula</button>
                </form>
              </div>
            </div>
          ))}

          <form action={createModule} className="flex items-center gap-2">
            <input type="hidden" name="course_id" value={cid} />
            <input name="title" placeholder="Título do novo módulo" className={input} />
            <button className={btn}>+ Módulo</button>
          </form>
        </div>
      </section>

      {/* AULAS AO VIVO */}
      <section className="mt-8 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Aulas ao vivo (Google Meet / Zoom)</h2>
        <div className="mt-4 space-y-2">
          {course.live_sessions.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma aula ao vivo agendada.</p>
          ) : (
            course.live_sessions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                <div>
                  <p className="font-medium text-slate-700">{s.title} <span className="text-xs uppercase text-brand">· {s.platform}</span></p>
                  <p className="text-xs text-slate-500">{new Date(s.starts_at).toLocaleString("pt-BR")}</p>
                </div>
                <form action={deleteLiveSession}>
                  <input type="hidden" name="course_id" value={cid} />
                  <input type="hidden" name="live_id" value={s.id} />
                  <button className="text-xs text-red-600 hover:underline">remover</button>
                </form>
              </div>
            ))
          )}
        </div>
        <form action={createLiveSession} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="course_id" value={cid} />
          <input name="title" placeholder="Título do encontro" className={input} />
          <select name="platform" className={input}>
            <option value="meet">Google Meet</option>
            <option value="zoom">Zoom</option>
          </select>
          <input name="starts_at" type="datetime-local" className={input} />
          <input name="join_url" placeholder="Link de acesso (https://...)" className={input} />
          <textarea name="description" placeholder="Descrição (opcional)" rows={2} className={`sm:col-span-2 ${input}`} />
          <button className={`${btn} sm:col-span-2`}>Agendar aula ao vivo</button>
        </form>
      </section>

      {/* EXCLUIR CURSO */}
      <section className="mt-10 border-t border-slate-200 pt-6">
        <form action={deleteCourse}>
          <input type="hidden" name="course_id" value={cid} />
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Excluir curso permanentemente
          </button>
        </form>
      </section>
    </div>
  );
}
