import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
        <p className="font-semibold text-brand-dark">GaiaMax</p>
        <p className="mt-1">
          Formação de terapeutas holísticos — mesa radiônica, limpeza energética e defesa psíquica.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <Link href="/privacidade" className="hover:text-brand">Política de Privacidade</Link>
          <Link href="/termos" className="hover:text-brand">Termos de Uso</Link>
          <Link href="/suporte" className="hover:text-brand">Suporte</Link>
        </div>
        <p className="mt-3 text-xs">
          Conteúdo educativo. Não substitui acompanhamento médico, psicológico ou psiquiátrico.
        </p>
        <p className="mt-2 text-xs">
          © {new Date().getFullYear()} GaiaMax. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
