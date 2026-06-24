import type { AuthorMeta } from "@/lib/forum";

const ROLE_LABEL: Record<string, string> = { aluno: "Aluno", instrutor: "Instrutor" };

export function AuthorBadges({ meta, max = 3 }: { meta?: AuthorMeta; max?: number }) {
  if (!meta) return null;

  const seen = new Set<string>();
  const badges = (meta.badges ?? []).filter((b) => {
    const k = `${b.role_context}:${b.course_title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // instrutor antes de aluno
  badges.sort((a, b) =>
    a.role_context === b.role_context ? 0 : a.role_context === "instrutor" ? -1 : 1
  );
  const shown = badges.slice(0, max);
  const extra = badges.length - shown.length;

  if (meta.role !== "admin" && shown.length === 0 && extra === 0) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {meta.role === "admin" ? (
        <span className="rounded-full bg-brand-dark px-2 py-0.5 text-[11px] font-medium text-white">
          Administrador
        </span>
      ) : null}
      {shown.map((b, i) => (
        <span
          key={i}
          className={
            b.role_context === "instrutor"
              ? "rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-white"
              : "rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand"
          }
        >
          {ROLE_LABEL[b.role_context] ?? b.role_context} · {b.course_title}
        </span>
      ))}
      {extra > 0 ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
