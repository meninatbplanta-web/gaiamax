import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { GoogleButton } from "@/components/google-button";

export default function CadastroPage({
  searchParams,
}: {
  searchParams: { erro?: string; ok?: string };
}) {
  if (searchParams.ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-dark">Confirme seu e-mail</h1>
        <p className="mt-3 text-slate-600">
          Enviamos um link de confirmacao para o seu e-mail. Clique nele para
          ativar sua conta e poder entrar.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Criar conta</h1>
      <p className="mt-1 text-sm text-slate-500">
        Comece sua formacao como terapeuta holistico.
      </p>

      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchParams.erro}
        </p>
      ) : null}

      <form action={signUp} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nome completo</label>
          <input
            name="full_name"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
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
            minLength={6}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
          <p className="mt-1 text-xs text-slate-400">Minimo de 6 caracteres.</p>
        </div>
        <button className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark">
          Criar conta
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> ou <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton next="/conta" />

      <p className="mt-6 text-center text-sm text-slate-500">
        Ja tem conta?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
