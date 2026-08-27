# 🌐 ACORDA PORTUGAL — PRESENCE & 24H REALTIME ACTIVITY ARCHITECTURE

## 1. Presença Real de Humanos
- **Coleção**: `presence/{sessionId}`
- **Campos Gravados**: `userId`, `online: boolean`, `lastSeen: number`, `activity: UserActivityState`, `district`, `level`, `xp`, `username`, `photoURL`, `isAnonymous`, `updatedAt`.
- **Mecanismo**: Heartbeat regular a cada 10–20 segundos via `PresenceProvider`.
- **Expiração / Timeout**: Sessões com inatividade superior a **45 segundos** deixam automaticamente de ser consideradas ativas.
- **Regra Absoluta**: **Bots NÃO são contabilizados como humanos no contador online**.

---

## 2. Modal Interativo de Jogadores Online (`components/online-players-modal.tsx`)
- Ao clicar no badge `🟢 X Pessoas Online` em qualquer parte da aplicação (Navbar, Hero, Rodapé):
  - Abre uma gaveta/modal com a contagem exata de humanos reais conectados.
  - Apresenta a lista pública de jogadores ativos: Avatar, Nome Sanitizado, Distrito, Nível Real, e Estado de Atividade (`🎮 A jogar quiz`, `⚔️ Em duelo 1v1`, `🏆 A ver ranking`, `🇵🇹 A explorar`).
  - Proteção total de privacidade: nenhum email ou UID privado é exposto.

---

## 3. Curva de Atividade 24 Horas em Portugal (`lib/activity-schedule.ts`)
- Fuso horário oficial: `Europe/Lisbon` (compatível com horário de verão e inverno).
- Fases horárias dinâmicas:
  - `00:00–06:00`: 🌙 Período Noturno (Madrugada)
  - `06:00–09:00`: 🌅 Início da Manhã (Despertar Nacional)
  - `09:00–12:00`: ☀️ Manhã Ativa
  - `12:00–14:00`: 🍽️ Hora de Almoço (Movimento Alto)
  - `14:00–18:00`: 🌤️ Tarde Ativa
  - `18:00–20:00`: 🌆 Fim de Tarde (Alta Atividade)
  - `20:00–23:00`: 🔥 Horário Nobre (Maior Movimento Nacional)
  - `23:00–00:00`: ✨ Noite Competitiva
- **Princípio Inegociável**: As estimativas horárias fornecem contexto de UX separado, **sem nunca inventar ou inflacionar a quantidade de humanos online**.
