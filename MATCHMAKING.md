# ⚔️ ACORDA PORTUGAL — MATCHMAKING & 1V1 DUELS ARCHITECTURE

## 1. Matchmaking 100% Humano e Autêntico

O sistema de emparelhamento de duelos opera exclusivamente entre **jogadores humanos reais**:
1. **Prioridade 1 (Humano Compatível)**: Procura nos primeiros 10 segundos um adversário humano online com proximidade de Rating ELO ($\pm 150$).
2. **Prioridade 2 (Expansão de Janela)**: A partir dos 10 segundos, expande a janela de ELO para $\pm 400$ pontos para permitir emparelhamento com qualquer outro jogador ativo.
3. **Timeout de Espera**: Se nenhum outro humano entrar na fila durante 30 segundos, a sala é cancelada com opção de tentar novamente ou desafiar um amigo por código de sala direto.

---

## 2. Ciclo de Vida da Sala de Duelo (`duels/{duelId}`)

```text
1. WAITING   -> Sala criada pelo Jogador 1 (aguarda adversário humano).
2. MATCHED   -> Adversário humano aceite; 3 segundos de contagem decrescente.
3. PLAYING   -> 10 perguntas sincronizadas com tempo limite de 60s por pergunta.
4. FINISHED  -> Verificação de pontuações, tempo total e determinação do vencedor.
5. REWARDED  -> Claim atómico server-side de XP, Moedas e atualização de Rating ELO.
```
