# 🇵🇹 ACORDA PORTUGAL — RELATÓRIO FORENSE FINAL: CORREÇÃO CRÍTICA DA LOJA & LIMITE 24H DE AJUDAS

## 1. Sumário Executivo

A auditoria forense e as correções de ponta a ponta na Loja do **Acorda Portugal** foram concluídas com **100% de sucesso**:
- Todos os 18 testes automatizados da economia passaram (`18/18 PASS`).
- A compilação Next.js 16.3.0 foi executada e validada sem erros (`npm run build`).
- Todos os 8 assets WebP exclusivos para ajudas foram gerados e verificados fisicamente no disco (`public/images/shop/aids/*.webp`), sem duplicações e sem `avatar_01.png`.
- A regra de compra de ajudas foi estritamente corrigida: **1 compra = 1 unidade = 1/3 do limite móvel de 24 horas**.

---

## 2. Diagnóstico Forense da Causa Raiz

| Vetor Auditado | Causa Raiz Identificada | Resolução Implementada |
| :--- | :--- | :--- |
| **Identificadores de Cosméticos** | O frontend apresentava títulos (`tit_pt_1`, etc.) e reações (`emote_rapido`, `emote_olho`, etc.) cujos IDs não existiam no catálogo central `lib/shop-catalog.ts`, resultando em respostas `404 Not Found`. | Unificação de todos os títulos oficiais (`TITLE_SHOP_CATALOG`) e reações (`OFFICIAL_EMOTES`) diretamente no catálogo SSOT central `SHOP_CATALOG`. |
| **Validação de Token Firebase** | No ambiente de desenvolvimento/local, a ausência das chaves de service account no `.env.local` fazia o `adminAuth.verifyIdToken()` falhar. | Mecanismo de autenticação server-authoritative com verificação primária via Admin SDK e fallback resiliente com validação direta via endpoint Google OAuth `oauth2.googleapis.com/tokeninfo`. Tokens inválidos retornam estritamente `401 Unauthorized`. |
| **Regra das Ajudas (Packs vs Unidades)** | As ajudas estavam configuradas em packs legados (ex: 5 unidades de 50/50 por 750 moedas), o que colidia com a regra de 1 compra = 1 unidade. | Configuração canónica em `lib/shop-catalog.ts` e `src/data/economy.ts`: cada compra adiciona exatamente 1 unidade de consumível. |
| **Limite Server-Side de 24 Horas** | Não existia imposição transacional de janela móvel no backend; apenas limites estáticos diários parciais em memória. | Criação da coleção Firestore `aid_purchase_limits/{userId}_{canonicalAidId}` gerenciada via transação atómica Firestore (`db.runTransaction`), filtrando eventos onde `timestampMs > now - 24h` e rejeitando qualquer compra se `purchasesLast24h + 1 > 3`. |
| **Diferenciação Stock vs 24h** | A interface confundia limite de inventário com limite de compras. | Separação completa na UI (`app/loja/page.tsx`) e na API: o botão exibe `"Compras 24h Esgotadas"` quando o limite móvel é atingido, e `"Inventário Cheio"` apenas quando o stock atinge 50 (ou 10 no caso de proteção de streak). |
| **Assets de Ajudas** | Existiam assets genéricos e placeholders duplicados. | Gerados 8 WebP exclusivos de alta definição (512x512) com temas visuais portugueses únicos: Pista Histórica, 50/50, Congelar Tempo, Pergunta ao Público, Segunda Oportunidade, Eliminação Tripla, Resposta Rápida e Proteção de Sequência. |

---

## 3. Catálogo Oficial das 8 Ajudas & Utilidades (SSOT)

| ID Canónico | Nome da Ajuda | Preço (Moedas) | Unidades / Compra | Limite Móvel 24h | Stock Máx | Asset Físico WebP |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **`AID_001`** | Pista Histórica | 🪙 750 | 1 un. | 3 / 24h | 50 | `/images/shop/aids/aid-pista-historica.webp` |
| **`AID_002`** | Ajuda 50/50 | 🪙 750 | 1 un. | 3 / 24h | 50 | `/images/shop/aids/aid-5050.webp` |
| **`AID_003`** | Congelar Tempo (+15s) | 🪙 900 | 1 un. | 3 / 24h | 50 | `/images/shop/aids/aid-congelar-tempo.webp` |
| **`AID_004`** | Pergunta ao Público | 🪙 600 | 1 un. | 3 / 24h | 50 | `/images/shop/aids/aid-pergunta-publico.webp` |
| **`AID_005`** | Segunda Oportunidade | 🪙 1.250 | 1 un. | 3 / 24h | 50 | `/images/shop/aids/aid-segunda-oportunidade.webp` |
| **`AID_006`** | Eliminação Tripla | 🪙 1.500 | 1 un. | 3 / 24h | 50 | `/images/shop/aids/aid-eliminacao-tripla.webp` |
| **`AID_007`** | Resposta Rápida (+5s) | 🪙 1.000 | 1 un. | 3 / 24h | 50 | `/images/shop/aids/aid-resposta-rapida.webp` |
| **`AID_008`** | Proteção de Sequência | 🪙 2.500 | 1 un. | 3 / 24h | 10 | `/images/shop/aids/aid-protecao-sequencia.webp` |

---

## 4. Arquitetura da Janela Móvel de 24 Horas (Server-Side)

### 4.1 Estrutura de Dados no Firestore
- Coleção: `aid_purchase_limits`
- ID do Documento: `{userId}_{canonicalAidId}`
- Estrutura:
```typescript
interface AidPurchaseLimitDoc {
  userId: string
  aidId: string
  purchases: Array<{
    timestampMs: number
    quantity: number
  }>
  lastPurchasedAt: FieldValue
  updatedAt: FieldValue
}
```

### 4.2 Lógica de Transação Atómica (`POST /api/shop/purchase`)
1. Leitura de `limitDocSnap = await transaction.get(limitDocRef)`.
2. Cálculo da janela: `cutoff24h = Date.now() - (24 * 60 * 60 * 1000)`.
3. Filtragem em tempo real: `recentPurchases = purchases.filter(p => p.timestampMs > cutoff24h)`.
4. Soma de unidades adquiridas na janela: `purchasesLast24h = recentPurchases.reduce((s, p) => s + p.quantity, 0)`.
5. Se `purchasesLast24h + 1 > 3`:
   - A transação é abortada imediatamente.
   - Lançamento de erro com mensagem autoritativa: `"Limite de 3 compras desta ajuda nas últimas 24 horas atingido."`
6. Se `purchasesLast24h < 3`:
   - Atualização atómica do documento com a nova compra e expiração automática dos registos fora da janela.
   - Débito de moedas do utilizador.
   - Incremento de stock na subcoleção `aid_inventory/{aidId}` e campos legados.
   - Emissão de registo imutável na coleção `coin_transactions`.

---

## 5. Proteção Anti-Pay-to-Win em Duelos 1v1
No endpoint `app/api/shop/aid/consume/route.ts`:
- Qualquer tentativa de ativação de consumíveis em partidas com `gameMode === 'duel' || gameMode === '1v1' || gameMode === 'competitive'` é bloqueada no servidor com código **403 Forbidden**.

---

## 6. Resultados dos Testes Forenses Automatizados
Execução via `npx tsx scripts/test_economy_forensic.ts`:
```text
🏁 RESULTADO FINAL DA AUDITORIA FORENSE: 18/18 TESTES APROVADOS!
✨ SISTEMA ECONÓMICO 100% BLINDADO E CONFORME AS DIRETIVAS.
```
