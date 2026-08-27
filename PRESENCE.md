# 🌐 ACORDA PORTUGAL — PRESENCE & REALTIME INDICATORS

## 1. Presença Real de Humanos
- **Coleção**: `presence/{sessionId}`
- **Mecanismo**: Heartbeat regular a cada 20 segundos via `PresenceProvider`.
- **Expiração**: Sessões com inatividade superior a **45 segundos** deixam automaticamente de ser consideradas ativas.
- **Regra Absoluta**: **Bots NÃO são contabilizados como humanos no contador online**.

---

## 2. Indicadores da Barra do Site (Navbar)
- `🟢 X ONLINE`: Pessoas humanas reais conectadas em tempo real.
- `⚔️ Y PARTIDAS`: Partidas e duelos atualmente em curso no servidor.
- **Transparência Total**: As métricas de humanos online e bots ativos são geridas e apresentadas separadamente.
