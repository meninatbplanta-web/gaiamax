import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";

export default function EsqueciSenhaPage({
  searchParams,
}: {
  searchParams: { ok?: string };
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Recuperar senha</h1>
      <p className="mt-1 text-sm text-slate-500">
        Informe seu e-mail e enviaremos um link para redefinir a senha.
      </p>

      {searchParams.ok ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Se este e-mail estiver cadastrado, enviamos um link para redefinir a senha.
        </p>
      ) : null}

      <form action={requestPasswordReset} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">E-mail</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <button className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark">
          Enviar link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-brand hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
