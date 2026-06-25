"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { MobileNav } from "@/components/mobile-nav";

export function SiteHeaderClient({
  loggedIn,
  isAdmin,
  accountLabel,
}: {
  loggedIn: boolean;
  isAdmin: boolean;
  accountLabel: string;
}) {
  const pathname = usePathname();
  const overlay = pathname === "/"; // home: header transparente sobre o vídeo

  const headerCls = overlay
    ? "absolute inset-x-0 top-0 z-30 bg-transparent"
    : "relative border-b border-slate-200 bg-white";
  const navText = overlay ? "text-white/90" : "text-slate-600";
  const linkHover = overlay ? "hover:text-white" : "hover:text-brand";
  const logoText = overlay ? "text-white" : "text-brand-dark";

  return (
    <header className={headerCls}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            G
          </span>
          <span className={`text-lg font-bold ${logoText}`}>GaiaMax</span>
        </Link>

        <nav className={`hidden items-center gap-5 text-sm font-medium md:flex ${navText}`}>
          <Link href="/cursos" className={linkHover}>Cursos</Link>
          <Link href="/forum" className={linkHover}>Fórum</Link>

          {loggedIn ? (
            <>
              <Link href="/meus-cursos" className={linkHover}>Meus cursos</Link>
              <Link href="/suporte" className={linkHover}>Suporte</Link>
              {isAdmin ? <Link href="/admin" className={linkHover}>Admin</Link> : null}
              <Link href="/conta" className={linkHover}>{accountLabel}</Link>
              <form action={signOut}>
                <button
                  className={
                    overlay
                      ? "rounded-lg border border-white/50 px-3 py-2 text-white transition hover:bg-white/10"
                      : "rounded-lg bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200"
                  }
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={linkHover}>Entrar</Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-brand px-4 py-2 text-white transition hover:bg-brand-dark"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>

        <MobileNav loggedIn={loggedIn} isAdmin={isAdmin} accountLabel={accountLabel} dark={overlay} />
      </div>
    </header>
  );
}
