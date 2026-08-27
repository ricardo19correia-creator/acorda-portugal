# 📈 ACORDA PORTUGAL — PROGRESSION & SINGLE SOURCE OF TRUTH

## 1. Single Source of Truth
- Todos os cálculos de XP, Nível, Rating ELO e Moedas são executados e validados **exclusivamente no servidor** via Firebase Admin SDK e endpoints seguros:
  - `/api/quiz/complete`: Conclusão de partidas de Quiz a solo.
  - `/api/duel/claim`: Atribuição de prémios e rating em duelos 1v1.
- O cliente nunca manipula diretamente valores de XP ou saldo de moedas no Firestore.

---

## 2. Fórmulas Canónicas de Progressão

### Cálculo de Nível por XP
$$\text{Level} = \max\left(1, \min\left(40, \left\lfloor\sqrt{\frac{\text{XP}}{85}}\right\rfloor\right)\right)$$

### XP Necessário para o Próximo Nível
$$\text{XP}_{\text{necessário}} = (\text{Level} + 1)^2 \times 85$$

### Recompensas de Quiz e Duelos
- **Quiz Solo**: $+100\text{ XP}$ por resposta correta ($+250\text{ XP}$ bónus de perfeição).
- **Duelo 1v1 (Vitória)**: $+300\text{ XP}$, $+18\text{ Rating ELO}$, Moedas base $+$ bónus.
- **Duelo 1v1 (Empate)**: $+150\text{ XP}$, $0\text{ Rating ELO}$, Moedas base.
- **Duelo 1v1 (Derrota)**: $+100\text{ XP}$, $-14\text{ Rating ELO}$.
