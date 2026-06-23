import Link from "next/link";
import { getPublishedCourses, getCategories } from "@/lib/courses";
import { CourseCard } from "@/components/course-card";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; free?: string };
}) {
  const [courses, categories] = await Promise.all([
    getPublishedCourses(searchParams),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-dark">Cursos</h1>
      <p className="mt-1 text-sm text-slate-500">Encontre sua próxima formação.</p>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-600">Buscar</label>
          <input name="search" defaultValue={searchParams.search ?? ""} placeholder="Título do curso..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Tema</label>
          <select name="category" defaultValue={searchParams.category ?? ""} className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">Todos</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Preço</label>
          <select name="free" defaultValue={searchParams.free ?? ""} className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">Todos</option>
            <option value="1">Gratuitos</option>
            <option value="0">Pagos</option>
          </select>
        </div>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">Filtrar</button>
      </form>

      {courses.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Nenhum curso encontrado.
        </div>
      )}
    </div>
  );
}
