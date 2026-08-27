# 🤖 ACORDA PORTUGAL — BOT SYSTEM & BOT WORLD ARCHITECTURE

## 1. Visão Geral
O sistema de Desafiantes Virtuais (Bot World) do Acorda Portugal é uma população viva e dinâmica de 125 jogadores virtuais (escalável para 250, 500, 1.000 e 5.000+) integrada no multiplayer 1v1, quizzes territoriais e rankings.

---

## 2. Estrutura de Dados & Separação Público/Privado

### Coleção Pública (`botPlayers/{botId}`)
Contém os dados visíveis no jogo e rankings:
- `id`: Identificador único (`BOT_0001` a `BOT_0125`)
- `isBot`: `true`
- `displayName`: Nome próprio português autêntico (ex: *Rui Mendes*, *Inês Carvalho*)
- `username`: `@ruimendes`, `@inescarvalho`
- `avatar`: URL ou SVG da biblioteca de 50+ combinações visuais
- `district`: Um dos 20 distritos/ilhas de Portugal
- `level`: Nível atual (1–40)
- `xp`: Pontos de experiência reais
- `rating`: Rating competitivo ELO (800–2200)
- `wins`, `losses`, `draws`, `streak`: Estatísticas competitivas
- `accuracyPercentage`: Precisão pública
- `avgResponseTimeMs`: Tempo médio de resposta em milissegundos
- `status`: `ACTIVE` | `INACTIVE` | `IN_MATCH` | `RETIRED` | `SUSPENDED`

### Coleção Privada (`botPlayersPrivate/{botId}`)
Acessível exclusivamente pelo Administrador e Firebase Admin SDK:
- `intelligencePercent`: Variável contínua entre **1 e 99**
- `personality`: `CASUAL` | `NORMAL` | `COMPETITIVO` | `ESPECIALISTA` | `ELITE`
- `difficulty`: `FACIL` | `MEDIO` | `DIFICIL` | `EXTREMO`
- `learningParameters`: Limites de aprendizagem (`dailyLearningLimit`, `weeklyLearningLimit`)
- `memory`: Histórico agregado das últimas 10 partidas e proficiências por categoria

---

## 3. Motores de Inteligência & Comportamento

### 1. `BotEngine` (`lib/bot-network/bot-engine.ts`)
- **Tomada de Decisão Estocástica**: Calcula a probabilidade de acerto com base em `intelligencePercent`, dificuldade da pergunta e afinidade temática.
- **Tempos Gaussianos (Box-Muller)**: Gera tempos humanizados (ex: 3.8s, 6.1s, 4.4s, 7.8s) com hesitação natural em perguntas de alta complexidade ou em caso de erro.

### 2. `BotEvolutionEngine` (`lib/bot-network/bot-evolution-engine.ts`)
- **Aprendizagem Gradual**: Ajusta a proficiência dos bots a longo prazo com limites diários ($+2\%$/dia) e semanais ($+5\%$/semana).
- **Memória Estatística**: Registo das últimas 10 partidas, precisão por categoria e atualização da média móvel de tempo.

### 3. `BotActivityEngine` (`lib/bot-network/bot-activity-engine.ts`)
- **Ritmo Circadiano**: Atividade baseada no fuso horário `Europe/Lisbon`.
- **Curva Dinâmica de 24 Horas**: Ativação progressiva de 5 desafiantes imediatos até 125 às 24h, adaptada em tempo real ao tráfego humano.

### 4. `BotTauntEngine` (`lib/bot-network/bot-taunt-engine.ts`)
- **Provocações Contextuais**: Mensagens no chat para eventos como `MATCH_START`, `PLAYER_CORRECT`, `BOT_CORRECT`, `PLAYER_WRONG`, `STREAK`, `FINAL_QUESTION`, `BOT_WIN` e `BOT_LOSS`, moduladas pela personalidade do bot.
