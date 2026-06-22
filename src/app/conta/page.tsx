import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

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

      <p className="mt-10 text-center text-sm text-slate-400">
        Em breve: seus cursos e seu progresso aparecerao aqui (Fase 6 e 7).
      </p>
    </div>
  );
}
