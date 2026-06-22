import { updatePassword } from "@/app/auth/actions";

export default function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Definir nova senha</h1>
      <p className="mt-1 text-sm text-slate-500">
        Escolha uma nova senha para sua conta.
      </p>

      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchParams.erro}
        </p>
      ) : null}

      <form action={updatePassword} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nova senha</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <button className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark">
          Salvar nova senha
        </button>
      </form>
    </div>
  );
}
