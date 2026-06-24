import Link from "next/link";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export async function SiteHeader() {
  const { user, profile } = await getUserAndProfile();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            G
          </span>
          <span className="text-lg font-bold text-brand-dark">GaiaMax</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link href="/cursos" className="hover:text-brand">
            Cursos
          </Link>

          <Link href="/forum" className="hover:text-brand">
            Fórum
          </Link>

          {user ? (
            <>
              <Link href="/meus-cursos" className="hover:text-brand">
                Meus cursos
              </Link>
              <Link href="/suporte" className="hover:text-brand">
                Suporte
              </Link>
              {profile?.role === "admin" ? (
                <Link href="/admin" className="hover:text-brand">
                  Admin
                </Link>
              ) : null}
              <Link href="/conta" className="hover:text-brand">
                {profile?.full_name?.split(" ")[0] ?? "Minha conta"}
              </Link>
              <form action={signOut}>
                <button className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-brand px-4 py-2 text-white transition hover:bg-brand-dark"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
