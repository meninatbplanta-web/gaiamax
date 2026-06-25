import Link from "next/link";

export function ForumPager({
  basePath,
  page,
  total,
  pageSize,
}: {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className="text-brand hover:underline">← Anterior</Link>
      ) : (
        <span />
      )}
      <span className="text-slate-400">Página {page} de {totalPages}</span>
      {page < totalPages ? (
        <Link href={`${basePath}?page=${page + 1}`} className="text-brand hover:underline">Próxima →</Link>
      ) : (
        <span />
      )}
    </div>
  );
}
