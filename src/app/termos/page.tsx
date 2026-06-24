import Link from "next/link";

export const metadata = { title: "Termos de Uso — GaiaMax" };

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-brand hover:underline">← Início</Link>
      <h1 className="mt-3 text-3xl font-bold text-brand-dark">Termos de Uso</h1>
      <p className="mt-1 text-sm text-slate-400">Última atualização: junho de 2026</p>

      <div className="mt-6 max-w-none space-y-4 text-slate-700">
        <h2 className="text-xl font-semibold text-brand-dark">1. Objeto</h2>
        <p>A GaiaMax é uma plataforma de educação a distância voltada à formação de terapeutas holísticos (mesa radiônica, limpeza energética, defesa psíquica e temas correlatos), oferecendo cursos em vídeo, materiais de apoio e aulas ao vivo.</p>

        <h2 className="text-xl font-semibold text-brand-dark">2. Cadastro e conta</h2>
        <p>Para acessar os cursos, é necessário criar uma conta com dados verdadeiros e manter a confidencialidade da sua senha. Você é responsável pelas atividades realizadas na sua conta.</p>

        <h2 className="text-xl font-semibold text-brand-dark">3. Natureza educativa do conteúdo</h2>
        <p>Todo o conteúdo tem finalidade educativa e informativa e <strong>não substitui</strong> acompanhamento ou tratamento médico, psicológico ou psiquiátrico. As práticas apresentadas não constituem promessa de cura ou de resultados específicos.</p>

        <h2 className="text-xl font-semibold text-brand-dark">4. Propriedade intelectual</h2>
        <p>Os cursos, vídeos e materiais são protegidos por direitos autorais. É vedado copiar, redistribuir, compartilhar acessos ou reproduzir o conteúdo fora da plataforma sem autorização.</p>

        <h2 className="text-xl font-semibold text-brand-dark">5. Pagamentos e acesso</h2>
        <p>Cursos pagos são processados pelas plataformas parceiras (Eduzz e Lia Pagamentos). O acesso é liberado após a confirmação do pagamento. Reembolsos e cancelamentos seguem as regras da plataforma de pagamento e a legislação aplicável.</p>

        <h2 className="text-xl font-semibold text-brand-dark">6. Conduta do usuário</h2>
        <p>Você concorda em não compartilhar sua conta, não tentar baixar ou redistribuir os vídeos, e não utilizar a plataforma para fins ilícitos.</p>

        <h2 className="text-xl font-semibold text-brand-dark">7. Limitação de responsabilidade</h2>
        <p>A GaiaMax empenha-se em manter a plataforma disponível e segura, mas não se responsabiliza por decisões tomadas pelo usuário com base no conteúdo educativo, nem por indisponibilidades de serviços de terceiros.</p>

        <h2 className="text-xl font-semibold text-brand-dark">8. Alterações</h2>
        <p>Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas pelos canais da plataforma.</p>

        <h2 className="text-xl font-semibold text-brand-dark">9. Contato</h2>
        <p>Dúvidas sobre estes termos podem ser enviadas pela área de Suporte.</p>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">Este documento é um modelo inicial. Recomendamos revisão por um advogado antes do lançamento comercial.</p>
      </div>
    </div>
  );
}
