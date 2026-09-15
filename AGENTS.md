<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# REGRA OBRIGATÓRIA DE DESENVOLVIMENTO E DEPLOY: PRODUÇÃO ONLINE IMEDIATA

Para **TODAS** as alterações realizadas no projeto **ACORDA PORTUGAL — DESAFIO NACIONAL**:

1. **Tudo o que for alterado tem de ficar ONLINE:**
   - Código, imagens, avatares, arenas, músicas, textos, páginas, componentes ou configurações.
   - Qualquer alteração deve ficar disponível para TODOS os utilizadores em produção.
   - **NÃO** basta alterar apenas no ambiente local ou localhost.
   - **NUNCA** responder "está alterado no projeto" ou similar se o deploy para produção ainda não foi efetuado.

2. **Fluxo Obrigatório em cada tarefa:**
   `ALTERAÇÃO LOCAL` ➔ `BUILD (npm.cmd run build)` ➔ `COMMIT & PUSH (git push origin main)` ➔ `DEPLOY AUTOMÁTICO VERCEL` ➔ `VERIFICAÇÃO EM PRODUÇÃO (https://acordaportugal.pt)` ➔ `DISPONÍVEL PARA TODOS OS UTILIZADORES`

3. **Capacitor / Aplicação Android (APK):**
   - A app Capacitor está configurada com `server.url: 'https://acordaportugal.pt'`, consumindo diretamente a versão online.
   - Sempre que o deploy para `https://acordaportugal.pt` for concluído, a app recebe as alterações automaticamente via web.
   - Se alguma alteração alterar código nativo Android, plugins Capacitor ou configurações de manifesto/ícone que exijam novo APK, gerar imediatamente nova build (`npm.cmd run build:apk`) e avisar explicitamente.

4. **Gestão de Cache e Verificação:**
   - Evitar que versões antigas de assets ou código fiquem retidas em cache.
   - Validar no final via chamada de rede/curl/endpoint que a versão em produção está ativa e funcional.

5. **Escopo e Foco:**
   - **NÃO ALTERAR** funcionalidades alheias que não façam parte do pedido solicitado pelo utilizador.

