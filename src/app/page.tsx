import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
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
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/"
              className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark"
            >
              Ver cursos
            </Link>
            <Link
              href="/health"
              className="rounded-lg border border-brand px-6 py-3 font-medium text-brand transition hover:bg-white"
            >
              Status da plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-brand-dark">
          O que você vai encontrar
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              titulo: "Videoaulas organizadas",
              texto:
                "Cursos divididos em módulos e aulas, com vídeo de qualidade e materiais de apoio.",
            },
            {
              titulo: "Acompanhe seu progresso",
              texto:
                "Marque aulas concluídas, veja sua porcentagem e continue de onde parou.",
            },
            {
              titulo: "Gratuitos e pagos",
              texto:
                "Comece por cursos introdutórios gratuitos e avance para formações completas.",
            },
          ].map((c) => (
            <div
              key={c.titulo}
              className="rounded-xl border border-slate-200 p-6 transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-brand-dark">{c.titulo}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.texto}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-slate-400">
          Plataforma em construção — Fase 0 (fundação) concluída.
        </p>
      </section>
    </div>
  );
}
