# 🇵🇹 RELATÓRIO DO SISTEMA DE AJUDAS & CONSUMÍVEIS (GAMEPLAY)

**Data de Conclusão:** 02 de Setembro de 2026  
**Sistema:** Acorda Portugal — Motor Autoritativo de Consumíveis  
**Endpoints Associados:**
- Compra: `POST /api/shop/purchase`
- Consumo: `POST /api/shop/aid/consume`

---

## 1. PRINCÍPIOS FUNDAMENTAIS & POLÍTICA ANTI-PAY-TO-WIN

1. **Ajudas como Facilitadores Pedagógicos:**  
   As ajudas existem para apoiar o jogador em modos individuais (Solo, Quiz Clássico, Desafios Distritais e Treino) a aprender factos históricos e culturais, reduzindo a frustração perante perguntas de dificuldade elevada.

2. **Proibição Absoluta no Modo Competitivo 1v1:**  
   Em duelos 1v1 em tempo real, a vitória pertence estritamente ao conhecimento, reflexos e precisão dos jogadores.  
   - O endpoint `/api/shop/aid/consume` valida no servidor se `gameMode === 'duel' || gameMode === '1v1'` e bloqueia sumariamente com HTTP 403.  
   - Nenhuma ajuda pode ser ativada para desequilibrar o confronto direto. Zero Pay-to-Win.

3. **Teto Máximo de Armazenamento (Anti-Hoarding):**  
   - Limite absoluto: **50 unidades acumuladas** por tipo de ajuda (`AID_MAX_OWNED_LIMIT = 50`).
   - Se o inventário atingir ou exceder o limite, o servidor rejeita novas compras com o erro:  
     `"Limite máximo de stock atingido (50 unidades)."`
   - A interface do utilizador reflete o estado em tempo real com o contador `Tens: X / 50` e o botão desativado exibindo `INVENTÁRIO CHEIO`.

4. **Transações Atómicas no Servidor:**  
   - O consumo e débito são calculados e registados atomicamente no Firestore via `db.runTransaction()`.
   - O saldo de stock nunca pode tornar-se negativo. Se `stock <= 0`, a tentativa é abortada.

---

## 2. CATÁLOGO CANÓNICO DOS 8 PACKS DE AJUDAS

| ID Canónico | Nome do Pack | Quantidade Fornecida | Preço Total | Custo Unitário | Razoabilidade Económica |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `aid_50_50` | Pack x5 Ajudas 50/50 | **5 un.** | **750 Moedas** | 150 Moedas / un. | Acessível após vencer 3 a 5 partidas solo. |
| `aid_public_vote` | Pack x3 Pergunta ao Público | **3 un.** | **600 Moedas** | 200 Moedas / un. | Simulação equilibrada da plateia. |
| `aid_freeze_time` | Pack x3 Congelar Tempo (+15s)| **3 un.** | **900 Moedas** | 300 Moedas / un. | Essencial em perguntas longas ou complexas. |
| `aid_hint` | Pack x3 Pista Inteligente | **3 un.** | **750 Moedas** | 250 Moedas / un. | Dica contextual pedagógica. |
| `aid_second_chance` | Pack x3 Segunda Oportunidade| **3 un.** | **1.250 Moedas** | 416 Moedas / un. | Permite segunda tentativa ao errar. |
| `aid_triple_elimination`| Pack x3 Eliminação Tripla | **3 un.** | **1.500 Moedas** | 500 Moedas / un. | Deixa apenas a resposta certa na mesa. |
| `aid_fast_answer` | Pack x3 Resposta Rápida | **3 un.** | **1.000 Moedas** | 333 Moedas / un. | Seleção imediata com preservação de bónus. |
| `aid_streak_protection`| Pack x1 Proteção de Sequência| **1 un.** | **2.500 Moedas** | 2.500 Moedas / un.| Seguro de 24h para manter o streak diário. |

---

## 3. ARQUITETURA DO MOTOR DE CONSUMO NO SERVIDOR (`/api/shop/aid/consume`)

### Fluxo de Execução:
1. **Autenticação Bearer:** Validação da assinatura do token Firebase do jogador.
2. **Checagem de Modo de Jogo:** Rejeição imediata se for modo 1v1.
3. **Validação de Stock:** Verificação da subcoleção `users/{uid}/aid_inventory/{aidId}` e do mapa `users/{uid}/inventory`.
4. **Débito Atómico:** Execução de `transaction.update(userRef, ...)` e decremento de 1 unidade.
5. **Cálculo de Efeito Server-Side:**
   - **50/50:** O servidor filtra as alternativas incorretas e sorteia exatamente duas para eliminar, garantindo que a resposta correta permanece 100% preservada.
   - **Público:** O servidor gera uma distribuição de votos ponderada aleatória cuja soma é matematicamente garantida em rigorosos 100%, conferindo entre 55% e 82% à alternativa correta.
   - **Congelar Tempo:** O servidor calcula o bónus temporal de 15 segundos (`+15000 ms`) e devolve o novo prazo de expiração validado.
   - **Pista:** O servidor sintetiza uma pista orientadora com base no contexto histórico da pergunta.
6. **Registo de Auditoria:** Log estruturado com `AID_CONSUMED`, saldo restante e identificador de partida.

---

## 4. IMPACTO NO BALANCEAMENTO ECONÓMICO

- **Ganho médio por vitória:** 15 Moedas (+ bónus de perfeição e streak até 25-35 Moedas).
- **Tempo para adquirir um Pack 50/50 (750 Moedas):** Aprox. 25 a 30 partidas bem-sucedidas ou 3 dias de desafios diários (50 Moedas/dia) e subidas de nível (25 Moedas/nível).
- **Sustentabilidade:** Os consumíveis servem como um sink de moedas contínuo e orgânico, evitando a acumulação descontrolada de moeda no endgame sem nunca prejudicar a experiência de quem joga sem gastar moedas.
