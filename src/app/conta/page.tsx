import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { deleteMyAccount } from "@/app/conta/actions";

const ROTULO_PAPEL: Record<string, string> = {
  aluno: "Aluno",
  instrutor: "Instrutor",
  admin: "Administrador",
};

export default async function ContaPage() {
  const { user, profile } = await requireUser();
  const papel = profile?.role ?? "aluno";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Minha conta</h1>

      <div className="mt-6 rounded-xl border border-slate-200 p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Nome</dt>
            <dd className="font-medium text-slate-800">{profile?.full_name ?? "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">E-mail</dt>
            <dd className="font-medium text-slate-800">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Perfil</dt>
            <dd className="font-medium text-brand">{ROTULO_PAPEL[papel] ?? papel}</dd>
          </div>
        </dl>
      </div>

      <Link
        href="/meus-cursos"
        className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Ir para Meus cursos
      </Link>

      {(papel === "instrutor" || papel === "admin") && (
        <Link
          href="/instrutor"
          className="mt-4 inline-block rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
        >
          Painel do instrutor
        </Link>
      )}
      {papel === "admin" && (
        <Link
          href="/admin"
          className="mt-4 ml-3 inline-block rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
        >
          Painel do administrador
        </Link>
      )}

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
