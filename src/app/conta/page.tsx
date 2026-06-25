import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { deleteMyAccount, updateProfile, changePassword } from "@/app/conta/actions";

const ROTULO_PAPEL: Record<string, string> = {
  aluno: "Aluno",
  instrutor: "Instrutor",
  admin: "Administrador",
};

export const dynamic = "force-dynamic";

export default async function ContaPage({
  searchParams,
}: {
  searchParams: { perfil?: string; senha?: string; senha_erro?: string; email_pendente?: string; erro?: string };
}) {
  const { user, profile } = await requireUser();
  const papel = profile?.role ?? "aluno";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Minha conta</h1>

      {searchParams.erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.erro}</p>
      ) : null}
      {searchParams.perfil ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Dados atualizados com sucesso.
          {searchParams.email_pendente
            ? " Enviamos um link de confirmação para o novo e-mail — o e-mail só muda após você confirmar."
            : ""}
        </p>
      ) : null}

      {/* Dados do perfil */}
      <div className="mt-6 rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-dark">Meus dados</h2>
          <span className="text-xs font-medium text-brand">{ROTULO_PAPEL[papel] ?? papel}</span>
        </div>
        <form action={updateProfile} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome</label>
            <input
              name="full_name"
              type="text"
              required
              defaultValue={profile?.full_name ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">E-mail</label>
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
            <p className="mt-1 text-xs text-slate-400">
              Alterar o e-mail exige confirmação pelo link enviado ao novo endereço.
            </p>
          </div>
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Salvar dados
          </button>
        </form>
      </div>

      {/* Troca de senha */}
      <div className="mt-6 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Trocar senha</h2>
        <form action={changePassword} className="mt-4 space-y-4">
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
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Salvar nova senha
          </button>
        </form>
      </div>

      {searchParams.senha ? (
        <p className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Senha alterada com sucesso.
        </p>
      ) : null}
      {searchParams.senha_erro ? (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchParams.senha_erro}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/meus-cursos"
          className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Ir para Meus cursos
        </Link>
        {(papel === "instrutor" || papel === "admin") && (
          <Link
            href="/instrutor"
            className="inline-block rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
          >
            Painel do instrutor
          </Link>
        )}
        {papel === "admin" && (
          <Link
            href="/admin"
            className="inline-block rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
          >
            Painel do administrador
          </Link>
        )}
      </div>

      <form action={signOut} className="mt-8">
        <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
          Sair
        </button>
      </form>

      <details className="mt-10 rounded-xl border border-red-200 p-5">
        <summary className="cursor-pointer text-sm font-medium text-red-600">Excluir minha conta</summary>
        <p className="mt-3 text-sm text-slate-600">
          Esta acao e permanente: remove sua conta e todos os dados associados (matriculas, progresso e duvidas). Nao pode ser desfeita.
        </p>
        <form action={deleteMyAccount} className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" required className="h-4 w-4" />
            Entendo que esta acao e permanente.
          </label>
          <button className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Excluir conta
          </button>
        </form>
      </details>
    </div>
  );
}
