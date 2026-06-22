# GaiaMax LMS

Marketplace de e-learning para formação de terapeutas holísticos (mesa radiônica, limpeza energética, defesa psíquica).

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS**
- **Supabase** (Postgres + Auth + Storage)
- **Vimeo** (vídeo das aulas)
- Pagamentos: **Eduzz** e **Lia Pagamentos** (via webhook)
- Deploy: **Vercel**

## Status

**Fase 0 — Fundação e deploy.** App navegável, layout base e wiring do Supabase com página de diagnóstico em `/health`. Veja o plano completo em `PLANO_DE_BUILD_LMS.md`.

## Configuração de ambiente

1. Copie `.env.example` para `.env.local`.
2. Preencha com as chaves do painel Supabase (Settings → API):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (segredo — só no servidor)
3. Na **Vercel**, configure essas mesmas variáveis em *Project → Settings → Environment Variables*.

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 e http://localhost:3000/health.

## Deploy

O deploy é automático na Vercel a cada push para o branch principal do repositório no GitHub.
