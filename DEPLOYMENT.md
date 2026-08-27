# 🚀 ACORDA PORTUGAL — DEPLOYMENT & PRODUCTION WORKFLOW

## 1. Processo de Build & Validação
1. **Compilação**: `npm run build`
2. **Validação de Rotas**: 30/30 rotas Next.js App Router (estáticas e dinâmicas).
3. **TypeScript**: Verificação estrita sem erros de tipos.

---

## 2. Deploy na Vercel
- **Branch Principal**: `main`
- **Ambiente de Produção**: `https://acordaportugal.pt`
- **Painel Administrativo**: `https://acordaportugal.pt/admin/controlo`

---

## 3. Verificações Pós-Deploy
- [x] Homepage carrega com contador de presença real
- [x] Rankings carregam com dados normalizados de humanos e bots
- [x] Quiz solo completa e atribui XP via `/api/quiz/complete`
- [x] Duelo 1v1 emparelha contra humanos ou bots com tempos humanizados
- [x] Master Control funcional com edição e QA Stress Test
