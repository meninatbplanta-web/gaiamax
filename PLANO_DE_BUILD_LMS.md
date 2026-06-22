# Plano de Build — LMS / Marketplace de E-Learning (Terapias Holísticas)

Documento de execução técnica. Divide a construção em **fases curtas, independentes e verificáveis**.
Cada fase só começa quando a anterior está com o "Pronto quando" (Definition of Done) cumprido.

**Stack base:** Next.js (App Router) + TypeScript + Tailwind/shadcn · Supabase (Postgres + Auth + Storage) · Vimeo Pro/Business · Eduzz + Lia (webhooks) · Deploy na Vercel.

**Princípio de segurança do plano:** nenhuma fase depende de mais de uma integração externa nova ao mesmo tempo. Pagamentos (a parte mais arriscada) ficam isolados em uma fase própria, já com tudo o mais funcionando.

---

## Visão geral das fases

| Fase | Nome | Resultado entregável | Risco |
|------|------|----------------------|-------|
| 0 | Fundação e deploy | Projeto no ar na Vercel, "esqueleto" navegável | Baixo |
| 1 | Autenticação e papéis | Login/cadastro com aluno, instrutor e admin | Baixo |
| 2 | Banco de dados e segurança (RLS) | Schema completo + regras de acesso + dados de teste | Médio |
| 3 | Criação de cursos (instrutor) | Instrutor cria curso → módulos → aulas | Médio |
| 4 | Videoaulas (Vimeo) | Player protegido por domínio dentro da aula | Médio |
| 5 | Catálogo e página de curso | Aluno navega, busca e vê detalhe do curso | Baixo |
| 6 | Matrícula e área do aluno | Curso gratuito + "Meus cursos" + player do curso | Médio |
| 7 | Acompanhamento de progresso | Aula concluída, % do curso, "continuar de onde parou" | Baixo |
| 8 | Pagamentos e webhooks | Eduzz/Lia liberam acesso automaticamente | **Alto** |
| 9 | Painel administrativo | Aprovar instrutores/cursos, mapear produtos, acesso manual | Médio |
| 10 | Acabamento, segurança e lançamento | LGPD, QA, performance, go-live | Médio |

> As fases 1–7 e 9 funcionam com cursos **gratuitos** ponta a ponta. A fase 8 (pagamentos) é a única que destrava cursos **pagos**, e é construída por último de propósito — quando todo o resto já estiver estável.

---

## Fase 0 — Fundação e deploy

**Objetivo:** ter um projeto rodando na Vercel desde o primeiro dia, para integrar e testar de forma contínua.

**Entregas**
- Repositório com Next.js + TypeScript + Tailwind + shadcn/ui configurados.
- Projeto Supabase criado (banco, auth e storage) e variáveis de ambiente conectadas.
- Deploy contínuo na Vercel (cada alteração publica automaticamente).
- Layout base: cabeçalho, rodapé, tema/cores, página inicial placeholder.
- Estrutura de pastas e padrões de código definidos.

**Dependências externas:** contas Vercel e Supabase.

**Pronto quando:** a URL da Vercel abre a home, conectada ao Supabase, e um "hello world" lê/escreve no banco com sucesso.

---

## Fase 1 — Autenticação e papéis

**Objetivo:** identificar quem é quem (aluno, instrutor, admin).

**Entregas**
- Cadastro e login por e-mail/senha; recuperação de senha; verificação de e-mail.
- Login com Google (opcional, reduz atrito).
- Tabela de perfis com papel (aluno por padrão; instrutor/admin atribuídos manualmente).
- Proteção de rotas por papel (aluno não acessa área de instrutor, etc.).
- Páginas: cadastro, login, "esqueci a senha", perfil básico.

**Dependências:** Fase 0.

**Pronto quando:** dá para criar conta, sair, voltar a entrar, e cada papel só acessa o que lhe é permitido.

---

## Fase 2 — Banco de dados e segurança (RLS)

**Objetivo:** estrutura de dados sólida antes de construir telas que dependem dela.

**Entregas**
- Tabelas: `courses`, `modules`, `lessons`, `enrollments`, `lesson_progress`, `payments`, `product_mappings`, `materials`.
- Relações e índices.
- Row Level Security (RLS): cada usuário acessa apenas seus dados; instrutor só edita seus cursos; admin vê tudo.
- Dados de teste (seed) com 1 instrutor, 2 cursos e 1 aluno para uso nas próximas fases.

**Dependências:** Fase 1 (precisa dos papéis).

**Pronto quando:** as tabelas existem, o seed roda, e tentativas de acesso indevido são bloqueadas pela RLS (testado).

---

## Fase 3 — Criação de cursos (instrutor)

**Objetivo:** instrutor consegue montar a estrutura de um curso (sem vídeo ainda).

**Entregas**
- Painel do instrutor: lista de cursos.
- Criar/editar curso: título, descrição, categoria, capa, nível, preço/gratuito, status (rascunho/revisão).
- Gerenciar módulos e aulas (criar, editar, reordenar por arrastar e soltar).
- Upload de capa e materiais (PDF) no Supabase Storage.

**Dependências:** Fase 2.

**Pronto quando:** um instrutor cria um curso completo com módulos e aulas, salva, sai e reabre com tudo persistido.

---

## Fase 4 — Videoaulas (Vimeo)

**Objetivo:** anexar e exibir vídeo de forma protegida.

**Entregas**
- Campo de vídeo na aula (ID/URL do Vimeo).
- Player incorporado com restrição por domínio (privacidade no Vimeo configurada).
- Aula de pré-visualização (free preview) opcional.
- Captura dos eventos do player (preparação para progresso na Fase 7).

**Dependências:** Fase 3 + conta Vimeo Pro/Business configurada.

**Pronto quando:** uma aula reproduz o vídeo dentro da plataforma e o mesmo vídeo não roda fora do domínio.

---

## Fase 5 — Catálogo e página de curso

**Objetivo:** aluno descobre os cursos.

**Entregas**
- Home com destaques e categorias do nicho.
- Listagem com filtro (tema, gratuito/pago) e busca.
- Página de detalhe: descrição, currículo (módulos/aulas), instrutor, preço, botão de inscrição/compra.
- Só cursos com status "publicado" aparecem.

**Dependências:** Fases 3 e 4.

**Pronto quando:** um visitante navega, busca e abre a página completa de um curso publicado.

---

## Fase 6 — Matrícula e área do aluno

**Objetivo:** aluno entra no curso e assiste (fluxo gratuito ponta a ponta).

**Entregas**
- Matrícula imediata em curso gratuito (1 clique).
- "Meus cursos": tudo em que o aluno está matriculado.
- Player do curso: lista do currículo + aula atual; acesso liberado só com matrícula ativa (verificado no servidor).

**Dependências:** Fase 5.

**Pronto quando:** um aluno se inscreve num curso gratuito, ele aparece em "Meus cursos" e as aulas reproduzem.

---

## Fase 7 — Acompanhamento de progresso

**Objetivo:** registrar e mostrar o avanço do aluno.

**Entregas**
- Marcar aula como concluída (manual e/ou automática ao atingir ~90% do vídeo).
- Barra de % de conclusão por curso.
- "Continuar de onde parou": sugere a próxima aula.
- Visão geral de progresso no painel do aluno.

**Dependências:** Fases 4 e 6.

**Pronto quando:** ao concluir aulas, o progresso é salvo, persiste entre sessões e a próxima aula é sugerida corretamente.

---

## Fase 8 — Pagamentos e webhooks (a fase mais crítica)

**Objetivo:** vender cursos pagos com liberação automática de acesso.

**Entregas**
- Mapeamento produto externo → curso (`product_mappings`) configurável no admin.
- Botão "Comprar" leva ao checkout correto: Eduzz (cartão/boleto à vista) ou Lia (boleto parcelado).
- Endpoint de webhook seguro: valida assinatura/chave de origem, é idempotente e registra eventos em `payments`.
- Eventos tratados: pago/aprovado → ativa matrícula; reembolso/chargeback/cancelamento → revoga acesso; boleto pendente → "aguardando pagamento".
- Casamento do comprador (e-mail) com o usuário; fallback de associação manual no admin.
- E-mail de confirmação de matrícula.

**Dependências:** Fases 6 e 9 (mapeamento no admin) + credenciais Eduzz e Lia.

**Pronto quando:** uma compra de teste em cada provedor dispara o webhook e o aluno ganha acesso automaticamente; um reembolso de teste remove o acesso.

> **Por que por último:** isola a integração mais sensível. Tudo o mais (cursos, vídeo, matrícula, progresso) já estará validado, então qualquer problema aqui é fácil de isolar.

---

## Fase 9 — Painel administrativo (proprietário)

**Objetivo:** você controla qualidade, acesso e pagamentos.

**Entregas**
- Gerir/convidar instrutores e papéis.
- Aprovar/publicar e despublicar cursos (controle de qualidade).
- Configurar o mapeamento de produtos Eduzz/Lia por curso.
- Ver matrículas/pagamentos; conceder/revogar acesso manualmente.
- Relatórios: receita estimada, cursos mais vendidos, alunos ativos.

**Dependências:** Fases 2–7 (parte do admin já é usada pela Fase 8).

**Pronto quando:** você aprova um instrutor, publica um curso, mapeia um produto e concede/revoga acesso pelo painel.

---

## Fase 10 — Acabamento, segurança e lançamento

**Objetivo:** deixar pronto para uso real.

**Entregas**
- LGPD: política de privacidade, consentimento, exclusão de conta/dados.
- Avisos legais (conteúdo educativo, não substitui acompanhamento profissional).
- Revisão de segurança: RLS, validação de webhooks, acesso a vídeo.
- Performance, responsividade (celular/tablet/desktop) e e-mails transacionais.
- QA ponta a ponta dos fluxos: cadastro → curso → matrícula → pagamento → progresso.
- Go-live com cursos e instrutores iniciais.

**Dependências:** todas as anteriores.

**Pronto quando:** os fluxos críticos passam no teste de ponta a ponta e a plataforma está publicada para os primeiros alunos.

---

## Como vamos trabalhar a cada fase

1. **Começo** confirmando o objetivo e as dependências da fase.
2. **Construo** as entregas em pequenos incrementos, publicando na Vercel.
3. **Verifico** contra o "Pronto quando" antes de seguir.
4. **Só então** avanço para a próxima fase.

**Pré-requisitos seus (para não travar):** contas/credenciais de **Vercel**, **Supabase**, **Vimeo Pro/Business**, **Eduzz** e **Lia Pagamentos**, além da **identidade visual** (nome, logo, cores). Os de pagamento (Eduzz/Lia) só são necessários a partir da Fase 8.

---

*Sugestão de início:* Fases 0 a 7 + 9 entregam a plataforma inteira funcionando com cursos gratuitos. A Fase 8 destrava a venda. Podemos validar tudo com conteúdo gratuito antes de ligar os pagamentos.
