import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole(["admin"]);
  const s = await getAdminStats();

  const Card = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-xl border border-slate-200 p-5">
      <p className="text-3xl font-bold text-brand-dark">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
  const NavLink = ({ href, title, desc }: { href: string; title: string; desc: string }) => (
    <Link href={href} className="rounded-xl border border-slate-200 p-5 transition hover:shadow-md">
      <p className="font-semibold text-brand-dark">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </Link>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-dark">Painel administrativo</h1>
      <p className="mt-1 text-sm text-slate-500">Controle de usuários, cursos, matrículas e suporte.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card label="Usuários" value={s.users} />
        <Card label="Cursos" value={s.courses} />
        <Card label="Publicados" value={s.published} />
        <Card label="Matrículas ativas" value={s.enrollments} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <NavLink href="/admin/usuarios" title="Usuários e papéis" desc="Promover instrutores e administradores." />
        <NavLink href="/admin/cursos" title="Cursos" desc="Publicar/despublicar e mapear produtos Eduzz/Lia." />
        <NavLink href="/admin/matriculas" title="Matrículas" desc="Conceder e revogar acesso; ver pagamentos." />
        <NavLink href="/suporte" title="Suporte" desc="Moderar e responder as dúvidas dos alunos." />
      </div>
    </div>
  );
}
