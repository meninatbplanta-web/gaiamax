import Link from "next/link";
import type { CourseRow } from "@/lib/courses";
import { LEVEL_LABEL } from "@/lib/courses";

export function CourseCard({ c }: { c: CourseRow }) {
  return (
    <Link
      href={`/cursos/${c.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 transition hover:shadow-md"
    >
      <div className="aspect-video w-full bg-brand-light">
        {c.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-brand/40">
            GaiaMax
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {c.category ? (
          <span className="text-xs font-medium uppercase tracking-wide text-brand">{c.category}</span>
        ) : null}
        <h3 className="mt-1 font-semibold text-brand-dark group-hover:text-brand">{c.title}</h3>
        {c.subtitle ? (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.subtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="text-xs text-slate-400">{LEVEL_LABEL[c.level]}</span>
          {c.is_free ? (
            <span className="font-semibold text-green-600">Gratuito</span>
          ) : (
            <span className="font-semibold text-slate-700">R$ {(c.price_cents / 100).toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
