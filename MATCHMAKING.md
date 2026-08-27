# ⚔️ ACORDA PORTUGAL — MATCHMAKING & 1V1 DUELS ARCHITECTURE

## 1. Prioridades do Matchmaking

O sistema de emparelhamento opera com 3 níveis sequenciais de prioridade:
1. **Prioridade 1 (Humano Compatível)**: Procura nos primeiros 5 segundos um adversário humano online com proximidade de Rating ELO ($\pm 150$).
2. **Prioridade 2 (Expansão de Janela)**: Entre 5 e 8 segundos, expande a janela de ELO para $\pm 400$ pontos.
3. **Prioridade 3 (Fallback para Desafiante Virtual)**: Aos 8–10 segundos, se nenhum humano estiver disponível, aciona o fallback inteligente de bot via `/api/duel/bot-match`.

---

## 2. Seleção de Bot e Anti-Repetição
- **Proximidade de ELO**: Seleciona entre os bots ativos aquele cujo rating mais se aproxima do jogador.
- **Cooldown Anti-Repetição**: Evita emparelhar consecutivamente com o mesmo bot enfrentado recentemente.
- **Diversidade**: Amostragem estocástica entre os 5 candidatos mais compatíveis.

---

## 3. Ciclo de Vida da Sala de Duelo (`duels/{duelId}`)

```text
1. WAITING   -> Sala criada pelo Player A (aguarda adversário).
2. MATCHED   -> Adversário (humano ou bot) aceite; 3 segundos de contagem decrescente.
3. PLAYING   -> 10 perguntas sincronizadas com tempo limite de 60s por pergunta.
4. FINISHED  -> Verificação de pontuações, tempo total e determinação do vencedor.
5. REWARDED  -> Claim atómico server-side de XP, Moedas e atualização de Rating ELO.
```
