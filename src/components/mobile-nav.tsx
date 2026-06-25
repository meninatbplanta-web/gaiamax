"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function MobileNav({
  loggedIn,
  isAdmin,
  accountLabel,
}: {
  loggedIn: boolean;
  isAdmin: boolean;
  accountLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const linkCls =
    "block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-brand-light hover:text-brand";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open ? (
        <>
          {/* fundo para fechar ao tocar fora */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 z-30 cursor-default bg-black/20"
          />
          <div className="absolute inset-x-0 top-full z-40 border-b border-slate-200 bg-white shadow-lg">
            <nav className="mx-auto max-w-6xl space-y-1 px-4 py-3">
              <Link href="/cursos" className={linkCls} onClick={close}>Cursos</Link>
              <Link href="/forum" className={linkCls} onClick={close}>Fórum</Link>
              {loggedIn ? (
                <>
                  <Link href="/meus-cursos" className={linkCls} onClick={close}>Meus cursos</Link>
                  <Link href="/suporte" className={linkCls} onClick={close}>Suporte</Link>
                  {isAdmin ? <Link href="/admin" className={linkCls} onClick={close}>Admin</Link> : null}
                  <Link href="/conta" className={linkCls} onClick={close}>{accountLabel}</Link>
                  <form action={signOut} className="pt-1">
                    <button className="w-full rounded-lg bg-slate-100 px-3 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-200">
                      Sair
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className={linkCls} onClick={close}>Entrar</Link>
                  <Link
                    href="/cadastro"
                    className="block rounded-lg bg-brand px-3 py-3 text-base font-medium text-white hover:bg-brand-dark"
                    onClick={close}
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
