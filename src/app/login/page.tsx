import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { GoogleButton } from "@/components/google-button";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Entrar</h1>
      <p className="mt-1 text-sm text-slate-500">
        Acesse sua conta para continuar seus cursos.
      </p>

      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchParams.erro}
        </p>
      ) : null}

      <form action={signIn} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">E-mail</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Senha</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <button className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark">
          Entrar
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> ou <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton next="/conta" />

      <div className="mt-6 flex justify-between text-sm">
        <Link href="/esqueci-senha" className="text-brand hover:underline">
          Esqueci a senha
        </Link>
        <Link href="/cadastro" className="text-brand hover:underline">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
