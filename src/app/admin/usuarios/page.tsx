import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAllUsers } from "@/lib/admin";
import { setUserRole, adminSetUsername } from "@/app/admin/actions";
import { ResetPasswordButton } from "@/components/reset-password-button";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: { u_ok?: string; u_erro?: string };
}) {
  await requireRole(["admin"]);
  const users = await getAllUsers();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin" className="text-sm text-brand hover:underline">← Painel</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-dark">Usuários e papéis</h1>
      <p className="mt-1 text-sm text-slate-500">{users.length} usuário(s).</p>

      {searchParams.u_ok ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Nome de usuário atualizado.</p>
      ) : null}
      {searchParams.u_erro ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.u_erro}</p>
      ) : null}

      <div className="mt-6 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
            <div>
              <p className="font-medium text-slate-800">
                {u.full_name ?? "(sem nome)"}
                {u.username ? <span className="ml-2 text-xs font-normal text-slate-400">@{u.username}</span> : null}
              </p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <form action={adminSetUsername} className="flex items-center gap-1">
                <input type="hidden" name="user_id" value={u.id} />
                <span className="text-sm text-slate-400">@</span>
                <input
                  name="username"
                  defaultValue={u.username ?? ""}
                  className="w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
                <button className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Salvar @
                </button>
              </form>
              <form action={setUserRole} className="flex items-center gap-2">
                <input type="hidden" name="user_id" value={u.id} />
                <select name="role" defaultValue={u.role} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                  <option value="aluno">Aluno</option>
                  <option value="instrutor">Instrutor</option>
                  <option value="admin">Administrador</option>
                </select>
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Salvar</button>
              </form>
              <ResetPasswordButton userId={u.id} email={u.email} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
