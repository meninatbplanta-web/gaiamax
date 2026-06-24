import { updatePassword, signOut } from "@/app/auth/actions";
import { getUserAndProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  const { user } = await getUserAndProfile();
  const obrigatorio = !!(user?.app_metadata as any)?.must_change_password;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Definir nova senha</h1>
      <p className="mt-1 text-sm text-slate-500">
        Escolha uma nova senha para sua conta.
      </p>

      {obrigatorio ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sua senha foi redefinida pelo administrador. Para continuar, defina uma nova senha abaixo.
        </p>
      ) : null}

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
        <div>
          <label className="block text-sm font-medium text-slate-700">Confirmar nova senha</label>
          <input
            name="confirm"
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

      {obrigatorio ? (
        <form action={signOut} className="mt-4">
          <button className="text-sm text-slate-500 hover:text-brand">Sair</button>
        </form>
      ) : null}
    </div>
  );
}
