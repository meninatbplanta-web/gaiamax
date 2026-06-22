import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            G
          </span>
          <span className="text-lg font-bold text-brand-dark">GaiaMax</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand">
            Cursos
          </Link>
          <Link href="/health" className="hover:text-brand">
            Status
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-brand px-4 py-2 text-white transition hover:bg-brand-dark"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
