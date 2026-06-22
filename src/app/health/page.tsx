import { createClient } from "@/lib/supabase/server";

// Página de diagnóstico (Fase 0): confirma se o app está no ar e se a
// conexão com o Supabase está configurada.
export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseOk = false;
  let detalhe = "";

  if (url && anon) {
    try {
      const supabase = createClient();
      // getSession não exige tabelas — valida apenas a comunicação/credenciais.
      const { error } = await supabase.auth.getSession();
      supabaseOk = !error;
      detalhe = error ? error.message : "Conexão estabelecida com sucesso.";
    } catch (e) {
      detalhe = e instanceof Error ? e.message : "Erro desconhecido.";
    }
  } else {
    detalhe = "Variáveis de ambiente do Supabase ainda não configuradas.";
  }

  const Item = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className="flex items-center gap-3">
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-white ${
          ok ? "bg-green-500" : "bg-amber-500"
        }`}
      >
        {ok ? "✓" : "!"}
      </span>
      <span className="text-slate-700">{label}</span>
    </li>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Status da plataforma</h1>
      <p className="mt-2 text-slate-600">
        Verificação automática da Fase 0 (fundação).
      </p>

      <ul className="mt-8 space-y-4 rounded-xl border border-slate-200 p-6">
        <Item ok={true} label="Aplicação Next.js no ar" />
        <Item ok={Boolean(url)} label="URL do Supabase configurada" />
        <Item ok={Boolean(anon)} label="Chave anônima do Supabase configurada" />
        <Item ok={supabaseOk} label="Comunicação com o Supabase" />
      </ul>

      <p className="mt-6 text-sm text-slate-500">{detalhe}</p>
    </div>
  );
}
