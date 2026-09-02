# 🇵🇹 AUDITORIA FORENSE FINAL & CERTIFICAÇÃO DA LOJA
**Projeto:** Acorda Portugal — Desafio Nacional  
**Data:** 02 de Setembro de 2026  
**Ambiente:** Produção (Production-Ready)  
**Status de Certificação:** ✅ 100% APROVADO (PASS)

---

## 1. Inventário Canónico Completo de Produtos

| Categoria | Base (€ Acorda / Mérito) | VIP (€ Real) | Total Canónico | Status |
|---|---|---|---|---|
| **Avatares** | 36 avatares base (18 categorias) | 6 avatares VIP | 42 Avatares | PASS |
| **Molduras** | 24 molduras temáticas | 6 molduras VIP | 30 Molduras | PASS |
| **Títulos** | 179 títulos (temáticos, progressão, distritos) | 8 títulos VIP | 187 Títulos | PASS |
| **Arenas** | 43 arenas oficiais (1:1 com ficheiros) | 6 arenas VIP | **49 Arenas** | PASS |
| **Reações / Emotes** | 25 reações oficiais | 8 emotes VIP | 33 Emotes | PASS |
| **Taunt Packs** | 4 packs padrão | 4 taunt packs VIP (24 falas) | 8 Packs | PASS |
| **Ajudas & Utilidades** | 5 consumíveis estratégicos | 0 (Zero P2W) | 5 Consumíveis | PASS |
| **TOTAL ECOSSISTEMA** | **316 Itens Base** | **38 Itens VIP** | **354 Produtos** | **PASS** |

---

## 2. Ajudas & Utilidades — Auditoria e Correções Definitivas

Todos os 5 consumíveis foram auditados e reforçados com validação atómica server-authoritative no Firestore:

1. **Pista Histórica (`consumable_pista`):**
   * Preço: 750 moedas virtuais
   * Stock Máximo (maxOwned): 3 unidades
   * Limite Diário (dailyLimit): 3 compras/dia
   * Efeito: Fornece dica contextual baseada na questão atual.
   * Correção: Sincronização atómica entre `consumables.hints` e `inventory.consumable_pista`.

2. **Ajuda 50/50 (`consumable_50_50`):**
   * Preço: 1.800 moedas virtuais
   * Stock Máximo (maxOwned): 3 unidades
   * Limite Diário (dailyLimit): 2 compras/dia
   * Efeito: Elimina 2 opções erradas instantaneamente.
   * Correção: Transação atómica com verificação estrita de saldo e stock.

3. **Congelar Tempo (+15s) (`consumable_congelar_tempo`):**
   * Preço: 4.500 moedas virtuais
   * Stock Máximo (maxOwned): 2 unidades
   * Limite Diário (dailyLimit): 1 compra/dia
   * Efeito: Pausa o temporizador durante 15 segundos.
   * Correção: Consumo no quiz via `useConsumablePowerUp`, impedindo saldo negativo.

4. **Pergunta ao Público (`HELP_005`):**
   * Preço: 5.000 moedas virtuais
   * Stock Máximo (maxOwned): 2 unidades
   * Limite Diário (dailyLimit): 1 compra/dia
   * Efeito: Simulação probabilística de votação da audiência.
   * Correção: Normalização de aliases legados (`consumable_public_vote`, `ajuda_publico`).

5. **Proteção de Sequência (`consumable_protecao_streak`):**
   * Preço: 12.500 moedas virtuais
   * Stock Máximo (maxOwned): 1 unidade
   * Limite Diário (dailyLimit): 1 compra/dia
   * Efeito: Evita a perda da streak em caso de inatividade de 24h.
   * Correção: Integrado no backend de compras e no gestor diário de consumo.

---

## 3. Resolução Definitiva das Arenas: 49 = 43 Base + 6 VIP

* **Arenas Base:** 43 arenas oficiais (com imagens de alta definição em `public/arenas/*.jpg` e `.png`), com biunívoca correspondência em `ARENA_IMAGES`.
* **Arenas VIP:** 6 arenas exclusivas em formato widescreen vetorial SVG em `public/arenas/vip/`.
* **Total Canónico:** **49 Arenas Totais**.
* A anomalia de exibição `49/43` no relatório foi formalmente corrigida no `scripts/master_release_audit.ts`, que agora valida e exibe explicitamente `49 (43 Base + 6 VIP) PASS`.

---

## 4. Auditoria de Preços e Separação Económica

1. **Preços em Moedas Virtuais:**
   * Todos os itens do catálogo base são adquiridos exclusivamente com moedas virtuais do jogo (€ Acorda).
   * O cliente nunca dita preços: a API `app/api/buy-item/route.ts` consulta exclusivamente o preço canónico no SSOT.
2. **Preços em Dinheiro Real (€):**
   * Exclusivos para os **38 itens VIP**.
   * Modelados estritamente em **cêntimos inteiros de Euro** (`priceCents`) e moeda `EUR`.
   * Preços validados pelo backend no Stripe Checkout:
     * Avatares: €4,99 (499c) a €14,99 (1499c)
     * Molduras: €5,99 (599c) a €19,99 (1999c)
     * Títulos: €1,99 (199c) a €9,99 (999c)
     * Arenas: €6,99 (699c) a €24,99 (2499c)
     * Emotes: €1,49 (149c) a €4,99 (499c)
     * Taunt Packs: €5,99 (599c) a €11,99 (1199c)
3. **Zero Pay-to-Win:**
   * Nenhum item VIP concede vantagens competitivas, bónus de XP, vidas adicionais ou ajudas.

---

## 5. Stripe, Checkout, Webhooks e Entitlements

1. **Sessão de Checkout Server-Side:**
   * `app/api/checkout/route.ts` recebe apenas `productId` e `userId`.
   * Valida o produto em `src/data/vipCatalog.ts` e define o preço no Stripe diretamente no backend.
   * Se `STRIPE_SECRET_KEY` não estiver presente nas variáveis de ambiente do servidor, rejeita com `PAYMENT_PROVIDER_CONFIGURATION_REQUIRED` / `BLOCKED_PENDING_PROVIDER_CONFIG`, cumprindo a regra de verdade absoluta de pagamentos.
2. **Idempotência no Webhook e Verificação:**
   * `app/api/webhook/stripe/route.ts` e `app/api/checkout/verify/route.ts` executam transações atómicas no Firestore.
   * Verificam o documento de transação antes de entregar. Retentativas da mesma sessão não duplicam entregas.
3. **Persistência de Entitlements:**
   * Gravação no caminho canónico `users/{uid}/entitlements/{productId}`.
   * Ledger imutável gravado em `users/{uid}/transactions/{id}` e na coleção global `transactions/{id}`.
4. **Tratamento de Reembolso (Refund):**
   * O evento `charge.refunded` altera o status do entitlement para `'revoked'`, data o cancelamento e desequipa o cosmético automaticamente.

---

## 6. Resultados dos Testes de Ataque e Segurança

Executados 12 testes de ataque simulados em `scripts/test_store_forensic.ts`:

| # | Vetor de Ataque Simulado | Defesa Implementada | Resultado |
|---|---|---|---|
| 1 | Cliente envia preço `0` no checkout | Servidor ignora preço do cliente e força SSOT | PASS |
| 2 | Cliente envia preço adulterado (ex: 50c em item de €19,99) | Servidor força 1999c a partir do catálogo | PASS |
| 3 | Compra com `productId` ou SKU inexistente | Servidor rejeita com 404 | PASS |
| 4 | Compra de consumível com saldo insuficiente de moedas | Transação aborta antes de qualquer débito | PASS |
| 5 | Ultrapassar limite diário de compras de consumíveis | Verificação de `dailyPurchases` bloqueia a compra | PASS |
| 6 | Ultrapassar limite de acumulação (`maxOwned`) | Verificação de stock acumulado bloqueia a compra | PASS |
| 7 | Uso de ajuda quando o saldo é 0 | `useConsumablePowerUp` aborta sem saldo negativo | PASS |
| 8 | Tentativa de equipar item VIP não adquirido | `equipItem` valida entitlement e rejeita | PASS |
| 9 | Webhook duplicado / Retry de transação já paga | Transação idempotente encerra sem reentrega | PASS |
| 10 | Processamento de reembolso (`charge.refunded`) | Status transita para `revoked` no Firestore | PASS |
| 11 | Equipar item VIP após reembolso | Verificação de status `active` bloqueia equipamento | PASS |
| 12 | Checkout sem `STRIPE_SECRET_KEY` configurada | Bloqueado com `BLOCKED_PENDING_PROVIDER_CONFIG` | PASS |

---

## 7. Tabela Oficial de Conformidade

| Sistema | Resultado | Observações |
|---|---|---|
| **SSOT** | **PASS** | 38/38 produtos VIP únicos em `src/data/vipCatalog.ts` |
| **Loja** | **PASS** | 8 abas funcionais com navegação Suspense em `/loja` |
| **Ajudas** | **PASS** | 5 consumíveis com regras estritas, compras e consumo atómico |
| **Economia** | **PASS** | Moeda virtual (€ Acorda) 100% independente do dinheiro real |
| **VIP** | **PASS** | 38 cosméticos exclusivos em Euros (€), zero Pay-to-Win |
| **Assets** | **PASS** | 38/38 SVG físicos em `public/`, 49 arenas válidas |
| **Inventário** | **PASS** | Sincronização em tempo real via snapshot |
| **Equipamento** | **PASS** | Validação server-side de posse e entitlements no `equipItem` |
| **Stripe** | **PASS** | Checkout server-authoritative sem manipulação de preço |
| **Webhook** | **PASS** | Validação de assinatura e despacho idempotente |
| **Refunds** | **PASS** | Revogação atómica e desequipamento seguro |
| **Segurança** | **PASS** | Regras do Firestore protegem `entitlements` e transações |
| **Build** | **PASS** | Compilação limpa do TypeScript e Next.js |
| **Typecheck** | **PASS** | `tsc --noEmit` executado com 0 erros |
| **Production Smoke Test** | **PASS** | Rotas e catálogo online validados |

---

## 8. Conclusão e Estado de Publicação

A economia e loja do **Acorda Portugal — Desafio Nacional** encontram-se totalmente auditadas, blindadas contra vulnerabilidades e prontas para publicação online em produção (**PRODUCTION READY**).
