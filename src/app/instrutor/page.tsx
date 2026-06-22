import { requireRole } from "@/lib/auth";

export default async function InstrutorPage() {
  const { profile } = await requireRole(["instrutor", "admin"]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Painel do instrutor</h1>
      <p className="mt-2 text-slate-600">
        Ola, {profile?.full_name ?? "instrutor"}. Aqui voce vai criar e gerenciar
        seus cursos.
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
        Criacao de cursos chega na Fase 3.
      </div>
    </div>
  );
}
