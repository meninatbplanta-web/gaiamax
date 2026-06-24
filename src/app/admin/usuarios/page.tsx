import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAllUsers } from "@/lib/admin";
import { setUserRole } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  await requireRole(["admin"]);
  const users = await getAllUsers();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin" className="text-sm text-brand hover:underline">← Painel</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-dark">Usuários e papéis</h1>
      <p className="mt-1 text-sm text-slate-500">{users.length} usuário(s).</p>

      <div className="mt-6 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
            <div>
              <p className="font-medium text-slate-800">{u.full_name ?? "(sem nome)"}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
            <form action={setUserRole} className="flex items-center gap-2">
              <input type="hidden" name="user_id" value={u.id} />
              <select name="role" defaultValue={u.role} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                <option value="aluno">Aluno</option>
                <option value="instrutor">Instrutor</option>
                <option value="admin">Administrador</option>
              </select>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Salvar</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
