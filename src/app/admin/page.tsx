import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  await requireRole(["admin"]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Painel do administrador</h1>
      <p className="mt-2 text-slate-600">
        Controle de instrutores, cursos, matriculas e pagamentos.
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
        Ferramentas administrativas chegam na Fase 9.
      </div>
    </div>
  );
}
