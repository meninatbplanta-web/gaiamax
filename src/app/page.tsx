import Link from "next/link";
import { getPublishedCourses } from "@/lib/courses";
import { CourseCard } from "@/components/course-card";

export default async function HomePage() {
  const courses = await getPublishedCourses();
  const destaque = courses.slice(0, 6);

  return (
    <div>
      <section className="bg-brand-light">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">
            Escola de Terapias Holísticas
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-brand-dark sm:text-5xl">
            Forme-se como terapeuta holístico no seu ritmo
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Cursos em vídeo de mesa radiônica, limpeza energética, defesa psíquica
            e espiritualidade aplicada. Aprenda com instrutores experientes e
            acompanhe seu progresso.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/cursos" className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark">
              Ver cursos
            </Link>
            <Link href="/cadastro" className="rounded-lg border border-brand px-6 py-3 font-medium text-brand transition hover:bg-white">
              Criar conta
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-dark">Cursos em destaque</h2>
          <Link href="/cursos" className="text-sm font-medium text-brand hover:underline">
            Ver todos →
          </Link>
        </div>

        {destaque.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destaque.map((c) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { t: "Videoaulas organizadas", d: "Cursos em módulos e aulas, com vídeo de qualidade e materiais de apoio." },
              { t: "Acompanhe seu progresso", d: "Marque aulas concluídas, veja sua porcentagem e continue de onde parou." },
              { t: "Gratuitos e pagos", d: "Comece por cursos introdutórios gratuitos e avance para formações completas." },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-brand-dark">{c.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{c.d}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
