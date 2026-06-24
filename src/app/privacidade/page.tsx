import Link from "next/link";

export const metadata = { title: "Política de Privacidade — GaiaMax" };

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-brand hover:underline">← Início</Link>
      <h1 className="mt-3 text-3xl font-bold text-brand-dark">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-slate-400">Última atualização: junho de 2026</p>

      <div className="prose mt-6 max-w-none space-y-4 text-slate-700">
        <p>A GaiaMax (&quot;plataforma&quot;) respeita a sua privacidade e trata seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Esta política explica quais dados coletamos, por que e como você pode exercer seus direitos.</p>

        <h2 className="text-xl font-semibold text-brand-dark">1. Dados que coletamos</h2>
        <p>Coletamos: nome e e-mail (no cadastro); senha (armazenada de forma criptografada, nunca em texto puro); dados de uso e progresso nos cursos; e, quando você compra um curso pago, dados de pagamento processados pelas plataformas parceiras (não armazenamos números de cartão).</p>

        <h2 className="text-xl font-semibold text-brand-dark">2. Para que usamos</h2>
        <p>Usamos seus dados para criar e manter sua conta, dar acesso aos cursos, registrar seu progresso, enviar comunicações essenciais (confirmação de cadastro, recuperação de senha, avisos de matrícula e respostas de suporte) e cumprir obrigações legais.</p>

        <h2 className="text-xl font-semibold text-brand-dark">3. Compartilhamento com terceiros</h2>
        <p>Para operar a plataforma, utilizamos prestadores que podem tratar dados em nosso nome: Supabase (banco de dados e autenticação), Vercel (hospedagem), Vimeo (hospedagem de vídeo), Brevo (envio de e-mails) e Eduzz e Lia Pagamentos (processamento de pagamentos). Cada um trata apenas o necessário para o serviço.</p>

        <h2 className="text-xl font-semibold text-brand-dark">4. Armazenamento e segurança</h2>
        <p>Os dados são armazenados em servidores seguros, com acesso restrito por papel e regras de segurança em nível de linha. Adotamos HTTPS e boas práticas para proteger suas informações.</p>

        <h2 className="text-xl font-semibold text-brand-dark">5. Seus direitos (LGPD)</h2>
        <p>Você pode, a qualquer momento, solicitar acesso, correção, portabilidade ou exclusão dos seus dados, além de revogar consentimentos. A exclusão da sua conta e dos dados associados pode ser feita por você mesmo em &quot;Minha conta&quot;, ou mediante solicitação pelo e-mail de contato.</p>

        <h2 className="text-xl font-semibold text-brand-dark">6. Cookies</h2>
        <p>Utilizamos cookies essenciais para manter você autenticado (sessão de login). Sem eles, não é possível acessar áreas restritas. Não utilizamos cookies de publicidade.</p>

        <h2 className="text-xl font-semibold text-brand-dark">7. Conteúdo educativo</h2>
        <p>O conteúdo da plataforma é de natureza educativa e não substitui acompanhamento médico, psicológico ou psiquiátrico.</p>

        <h2 className="text-xl font-semibold text-brand-dark">8. Contato</h2>
        <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade, fale conosco pela área de Suporte ou pelo e-mail informado em nossos canais oficiais.</p>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">Este documento é um modelo inicial. Recomendamos revisão por um advogado para adequá-lo integralmente à sua operação antes do lançamento comercial.</p>
      </div>
    </div>
  );
}
