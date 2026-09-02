# 🇵🇹 ACORDA PORTUGAL — ECONOMY AUDIT REPORT
## Relatório Forense de Auditoria Económica da Loja e Inventários

**Data:** 02/09/2026  
**Ambiente:** Acorda Portugal (Next.js 16 / React 19 / Firebase Firestore / Capacitor Android)  
**Objetivo:** Auditoria forense completa à economia virtual, catálogo de cosméticos, consumíveis de gameplay, itens de mérito e produtos VIP em dinheiro real.

---

## 1. RESUMO EXECUTIVO DA AUDITORIA

A auditoria forense ao código-fonte revelou que a economia do Acorda Portugal sofria de **grave fragmentação arquitetural**, com preços hardcoded em múltiplos ficheiros, discrepâncias extremas entre componentes de interface e ficheiros de dados, ausência de idempotência em transações de compra e riscos de segurança por execução de mutações financeiras no cliente.

### Principais Anomalias Encontradas:
1. **Discrepância Crítica em Avatares:**
   - No ficheiro `lib/avatars.ts`, os avatares `avatar_05` a `avatar_34` tinham preços entre **500 e 3.500 moedas**.
   - No ficheiro `src/data/shopAvatars.ts` e na interface `app/loja/page.tsx`, os mesmos avatares estavam marcados entre **6.000 e 65.000 moedas**!
   - Um jogador que visualizasse o perfil via um preço; na loja via outro preço até 20 vezes superior.
2. **Caos de Preços em Títulos:**
   - O título `title_rei_18_distritos` custava **55.000 moedas** em `lib/economy.ts`, mas custava **18.000 moedas** em `lib/titles.ts`.
   - O título `title_tuga_cibernetico` custava **18.000 moedas** em `lib/economy.ts`, mas **6.000 moedas** em `lib/titles.ts`.
   - O título `title_terror_do_quiz` custava **6.000 moedas** em `lib/economy.ts`, mas **2.800 moedas** em `lib/titles.ts`.
3. **Ajudas & Consumíveis Hardcoded na Interface:**
   - Em `app/loja/page.tsx`, o array `OTHER_SHOP_ITEMS` estava definido diretamente no componente React, com a ajuda 50/50 a custar 1.800 moedas (1 unidade) e Congelar Tempo a 4.500 moedas (1 unidade), em vez dos packs funcionais rebalanceados pedidos (Pack x5 50/50 a 750 moedas; Pack x3 Congelar Tempo a 900 moedas).
4. **Vulnerabilidade de Compra e Manipulação no Cliente:**
   - Em `app/loja/page.tsx`, quando `!auth.currentUser`, a dedução de saldo era feita via função cliente `deductCoins()` e gravada em `localStorage`, permitindo compras forjadas sem validação do servidor.
   - O endpoint `/api/buy-item` não validava uma chave de idempotência (`idempotencyKey`).
5. **Consumo de Ajudas sem Autoridade do Servidor:**
   - No ficheiro `components/quiz/quiz-screen.tsx`, o uso de 50/50, congelar tempo e público disparava mutações diretas no Firestore via `updateDoc(doc(db, 'users', uid), ...)` pelo cliente, sem endpoint server-side de autorização de consumo.
6. **Infiltração de Itens VIP na Moeda Virtual:**
   - Em `lib/economy.ts`, os temas "Tema VIP: Templo de Ouro de D. Dinis" (65.000 moedas) e "Tema VIP: Matriz Cósmica dos Descobrimentos" (95.000 moedas) estavam à venda por moedas virtuais, violando a regra de que cosméticos VIP em € Real nunca podem ser adquiridos com moedas.

---

## 2. TABELA FORENSE COMPLETA: TODOS OS ITENS E PREÇOS ENCONTRADOS

### Categoria A: Avatares (36 Itens)

| Item ID | Nome do Avatar | Preço Frontend (`loja/page.tsx`) | Preço Backend (`shopAvatars.ts`) | Preço Legado (`lib/avatars.ts`) | Método de Compra | Desbloqueio | Duplicação / Conflito Detectado | Novo Preço Canónico |
|---|---|---|---|---|---|---|---|---|
| `avatar_01` | O Estratega | GRÁTIS (0) | 0 | 0 (Grátis) | Automático | Inicial | Não | **0** |
| `avatar_02` | A Líder | GRÁTIS (0) | 0 | 0 (Grátis) | Automático | Inicial | Não | **0** |
| `avatar_03` | O Explorador | GRÁTIS (0) | 0 | 0 (Grátis) | Automático | Inicial | Não | **0** |
| `avatar_04` | A Competidora | GRÁTIS (0) | 0 | 0 (Grátis) | Automático | Inicial | Não | **0** |
| `avatar_05` | O Mestre | 6.000 Moedas | 6.000 | 500 | Moedas | Compra | **Sim: 6.000 vs 500** | **500** |
| `avatar_06` | A Gamer | 6.500 Moedas | 6.500 | 500 | Moedas | Compra | **Sim: 6.500 vs 500** | **600** |
| `avatar_07` | O Descontraído | 7.000 Moedas | 7.000 | 500 | Moedas | Compra | **Sim: 7.000 vs 500** | **700** |
| `avatar_08` | A Visionária | 7.500 Moedas | 7.500 | 750 | Moedas | Compra | **Sim: 7.500 vs 750** | **800** |
| `avatar_09` | O Rebelde | 8.000 Moedas | 8.000 | 750 | Moedas | Compra | **Sim: 8.000 vs 750** | **900** |
| `avatar_10` | A Investigadora | 8.500 Moedas | 8.500 | 750 | Moedas | Compra | **Sim: 8.500 vs 750** | **1.000** |
| `avatar_11` | O Desportista | 15.000 Moedas | 15.000 | 1.000 | Moedas | Compra | **Sim: 15.000 vs 1.000** | **1.250** |
| `avatar_12` | A Artista | 15.000 Moedas | 15.000 | 1.000 | Moedas | Compra | **Sim: 15.000 vs 1.000** | **1.400** |
| `avatar_13` | O Professor | 16.000 Moedas | 16.000 | 1.000 | Moedas | Compra | **Sim: 16.000 vs 1.000** | **1.500** |
| `avatar_14` | A Aventureira | 16.500 Moedas | 16.500 | 1.250 | Moedas | Compra | **Sim: 16.500 vs 1.250** | **1.600** |
| `avatar_15` | O Técnico | 17.500 Moedas | 17.500 | 1.250 | Moedas | Compra | **Sim: 17.500 vs 1.250** | **1.800** |
| `avatar_16` | A Estratega | 18.000 Moedas | 18.000 | 1.500 | Moedas | Compra | **Sim: 18.000 vs 1.500** | **2.000** |
| `avatar_17` | O Visionário | 18.500 Moedas | 18.500 | 1.500 | Moedas | Compra | **Sim: 18.500 vs 1.500** | **2.200** |
| `avatar_18` | A Campeã | 40.000 Moedas | 40.000 | 2.000 | Moedas | Compra | **Sim: 40.000 vs 2.000** | **3.500** |
| `avatar_19` | O Curioso | 9.000 Moedas | 9.000 | 750 | Moedas | Compra | **Sim: 9.000 vs 750** | **850** |
| `avatar_20` | A Investigadora Urbana | 19.000 Moedas | 19.000 | 1.500 | Moedas | Compra | **Sim: 19.000 vs 1.500** | **1.750** |
| `avatar_21` | O Capitão | 45.000 Moedas | 45.000 | 2.500 | Moedas | Compra | **Sim: 45.000 vs 2.500** | **4.000** |
| `avatar_22` | A Criativa | 20.000 Moedas | 20.000 | 1.500 | Moedas | Compra | **Sim: 20.000 vs 1.500** | **1.900** |
| `avatar_23` | O Minimalista | 21.000 Moedas | 21.000 | 1.750 | Moedas | Compra | **Sim: 21.000 vs 1.750** | **2.100** |
| `avatar_24` | A Challenger | 22.500 Moedas | 22.500 | 1.750 | Moedas | Compra | **Sim: 22.500 vs 1.750** | **2.300** |
| `avatar_25` | O Geek | 23.000 Moedas | 23.000 | 2.000 | Moedas | Compra | **Sim: 23.000 vs 2.000** | **2.400** |
| `avatar_26` | A Analista | 24.000 Moedas | 24.000 | 2.000 | Moedas | Compra | **Sim: 24.000 vs 2.000** | **2.500** |
| `avatar_27` | O Comunicador | 24.500 Moedas | 24.500 | 2.250 | Moedas | Compra | **Sim: 24.500 vs 2.250** | **2.500** |
| `avatar_28` | A Exploradora Digital | 48.000 Moedas | 48.000 | 2.500 | Moedas | Compra | **Sim: 48.000 vs 2.500** | **4.500** |
| `avatar_29` | O Mestre do Quiz | 52.000 Moedas | 52.000 | 2.750 | Moedas | Compra | **Sim: 52.000 vs 2.750** | **5.000** |
| `avatar_30` | A Rainha do Ranking | POR MÉRITO | null | null | Conquista | Top 10 Ranking | Não | **MÉRITO (0)** |
| `avatar_31` | O Veterano | 55.000 Moedas | 55.000 | 2.750 | Moedas | Compra | **Sim: 55.000 vs 2.750** | **5.500** |
| `avatar_32` | A Nova Geração | 25.000 Moedas | 25.000 | 2.000 | Moedas | Compra | **Sim: 25.000 vs 2.000** | **2.500** |
| `avatar_33` | O Campeão | 60.000 Moedas | 60.000 | 3.000 | Moedas | Compra | **Sim: 60.000 vs 3.000** | **6.000** |
| `avatar_34` | A Lenda | 65.000 Moedas | 65.000 | 3.500 | Moedas | Compra | **Sim: 65.000 vs 3.500** | **9.500** |
| `avatar_35` | O Desafiante | POR MÉRITO | null | null | Conquista | 100 Vitórias 1v1 | Não | **MÉRITO (0)** |
| `avatar_36` | A Lenda Portuguesa | POR MÉRITO | null | null | Conquista | Lenda de Portugal | Não | **MÉRITO (0)** |

---

### Categoria B: Molduras Vivas de Avatar (24 Itens)

| Item ID | Nome da Moldura | Preço Atual Frontend & Backend | Raridade | Faixa Alvo do Rebalanceamento | Problema / Anomalia | Novo Preço Canónico |
|---|---|---|---|---|---|---|
| `frame_fogo_eterno` | Inferno Solar & Fogo Eterno | 18.000 Moedas | Épico | 3.500 – 6.000 | Preço inflacionado (18k) | **4.500** |
| `frame_ondas_atlantico` | Ondas do Atlântico | 6.500 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (6.5k) | **2.000** |
| `frame_tempestade_eletrica` | Fúria do Trovão & Raios | 18.500 Moedas | Épico | 3.500 – 6.000 | Preço inflacionado (18.5k) | **5.000** |
| `frame_gelo_ancestral` | Zero Absoluto & Gelo Ancestral | 6.500 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (6.5k) | **2.200** |
| `frame_terra_viva` | Raízes Antigas & Terra Viva | 7.000 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (7k) | **2.400** |
| `frame_sol_dourado` | Fénix Solar & Labaredas Míticas | 95.000 Moedas | Mítico | 15.000 – 25.000+ | Preço proibitivo (95k) | **22.500** |
| `frame_nevoa_sintrense` | Névoa Mística de Sintra | 20.000 Moedas | Épico | 3.500 – 6.000 | Preço inflacionado (20k) | **5.500** |
| `frame_orvalho_floresta` | Esmeralda dos Bosques Sagrados | 7.500 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (7.5k) | **2.500** |
| `frame_abismo_oceanico` | Leviatã do Abismo das Quinas | 110.000 Moedas | Mítico | 15.000 – 25.000+ | Preço proibitivo (110k) | **25.000** |
| `frame_aurora_boreal` | Aurora Boreal Atlântica | 45.000 Moedas | Lendário | 7.500 – 12.500 | Preço inflacionado (45k) | **10.000** |
| `frame_vortex_cosmico` | Vórtice Dimensional Infinito | 50.000 Moedas | Lendário | 7.500 – 12.500 | Preço inflacionado (50k) | **11.500** |
| `frame_imperador_galactico` | Singularidade Cósmica das Quinas | 125.000 Moedas | Mítico | 15.000 – 25.000+ | Preço proibitivo (125k) | **28.000** |
| `frame_realeza_lusitana` | Brasão Real & Ouro Nobre | 55.000 Moedas | Lendário | 7.500 – 12.500 | Preço inflacionado (55k) | **12.000** |
| `frame_ouro_afonso` | Aço de Guimarães & Ouro Lusitano | 22.500 Moedas | Épico | 3.500 – 6.000 | Preço inflacionado (22.5k) | **5.800** |
| `frame_coroa_louros` | Coroa Imperial dos Vencedores | 65.000 Moedas | Lendário | 7.500 – 12.500 | Preço inflacionado (65k) | **12.500** |
| `frame_cristal_diamante` | Prisma Imperial de Diamante Puro | 58.000 Moedas | Lendário | 7.500 – 12.500 | Preço inflacionado (58k) | **11.000** |
| `frame_calcada_portuguesa` | Alma da Calçada & Estilo Urbano | 8.000 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (8k) | **2.600** |
| `frame_azulejo_seculoxvii` | Mestre dos Azulejos Históricos | 8.500 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (8.5k) | **2.700** |
| `frame_galo_barcelos` | Lenda Viva do Galo de Barcelos | 25.000 Moedas | Épico | 3.500 – 6.000 | Preço inflacionado (25k) | **6.000** |
| `frame_caravela_dourada` | Vento nas Velas & Cruz de Cristo | 8.500 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (8.5k) | **3.000** |
| `frame_neon_arcade_80s` | Retro Laser Synthwave 80s | 9.000 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (9k) | **2.200** |
| `frame_matrix_digital` | Ciber-Rede Nacional & Código Verde | 9.000 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (9k) | **2.500** |
| `frame_prisma_holografico` | Prisma Holográfico Hexagonal | 9.500 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (9.5k) | **2.800** |
| `frame_cyber_glitch_2077` | Glitch Holográfico Cyber-Luso 2077 | 10.000 Moedas | Raro | 1.500 – 3.000 | Preço inflacionado (10k) | **3.000** |

---

### Categoria C: Arenas (43 Base + 3 Ultra-Exclusivas por Mérito)

| Item ID | Nome da Arena | Preço Anterior | Raridade | Problema Encontrado | Novo Preço Canónico |
|---|---|---|---|---|---|
| `arena_praca_liberdade` | Praça da Liberdade | 0 | Comum | Gratuita (Padrão) | **0 (GRÁTIS)** |
| `arena_castelo_obidos` | Castelo de Óbidos | 18.000 | Rara | Preço inflacionado para Rara | **4.500** |
| `arena_costa_atlantica` | Costa Atlântica | 7.500 | Rara | Fora da faixa | **3.500** |
| `arena_ponte_d_luis` | Ponte D. Luís I | 8.000 | Rara | Fora da faixa | **4.000** |
| `arena_lisboa_imperial` | Lisboa Imperial | 45.000 | Épica | Preço inflacionado para Épica | **8.500** |
| `arena_torre_belem` | Torre de Belém | 50.000 | Rara | Preço absurdo para item Raro | **5.000** |
| `arena_lisboa_imperial_noturna` | Lisboa Imperial Noturna | 8.500 | Épica | Inconsistência de raridade | **7.500** |
| `arena_ponte_douro_panoramica` | Ponte do Douro Panorâmica | 18.500 | Épica | Fora da faixa | **8.000** |
| `arena_cidade_norte` | Cidade Histórica do Norte | 2.000 | Comum | Dentro da faixa | **2.000** |
| `arena_vulcao_erupcao` | Vulcão dos Açores | 19.000 | Épica | Fora da faixa | **9.000** |
| `arena_vulcao_furnas` | Caldeiras das Furnas | 20.000 | Épica | Fora da faixa | **9.500** |
| `arena_madeira_tropical` | Madeira Tropical | 8.500 | Rara | Fora da faixa | **4.200** |
| `arena_pico_estrelas` | Pico Sob as Estrelas | 48.000 | Lendária | Fora da faixa | **14.000** |
| `arena_madeira_noite` | Noite do Funchal | 9.000 | Rara | Fora da faixa | **4.500** |
| `arena_pico_aurora` | Pico com Aurora Mística | 52.000 | Lendária | Fora da faixa | **15.000** |
| `arena_costa_selvagem` | Falésias da Costa Selvagem | 2.500 | Comum | Dentro da faixa | **2.500** |
| `arena_portugal_medieval` | Muralhas Medievais | 10.500 | Épica | Dentro da faixa | **8.500** |
| `arena_era_descobrimentos` | Cais dos Descobrimentos | 55.000 | Lendária | Fora da faixa | **16.000** |
| `arena_batalha_medieval` | Campo de Batalha Real | 22.000 | Épica | Fora da faixa | **10.000** |
| `arena_corte_portuguesa` | Salão Nobre da Corte | 58.000 | Lendária | Fora da faixa | **17.500** |
| `arena_mosteiro_antigo` | Claustros do Mosteiro | 9.500 | Comum | Preço muito alto para Comum | **2.200** |
| `arena_festival_portugues` | Noite de Santos Populares | 3.000 | Comum | Dentro da faixa | **2.800** |
| `arena_fado_alfama` | Calçadas de Alfama | 11.000 | Rara | Preço muito alto para Rara | **4.800** |
| `arena_teatro_nacional` | Palco do Teatro Nacional | 24.000 | Épica | Fora da faixa | **11.000** |
| `arena_estadio_nacional` | Estádio Nacional do Jamor | 10.000 | Lendária | Preço baixo para Lendária | **13.500** |
| `arena_noite_jogo` | Noite de Clássico | 22.500 | Lendária | Fora da faixa | **15.500** |
| `arena_final_nacional` | Final da Taça de Portugal | 60.000 | Lendária | Preço exorbitante | **18.000** |
| `arena_noite_selecao` | Conquista da Seleção das Quinas | 70.000 | Lendária | Preço exorbitante | **20.000** |
| `arena_duelo_1v1_oficial` | Arena Oficial de Duelos 1v1 | 85.000 | Lendária | Preço exorbitante | **22.500** |
| `arena_ponte_2077` | Ponte 25 de Abril Cyber 2077 | 25.000 | Mítica | Dentro da faixa | **26.000** |
| `arena_lisboa_cybercore` | Lisboa Cybercore Néon | 62.000 | Mítica | Preço proibitivo | **30.000** |
| `arena_estacao_orbital` | Estação Orbital Lusitana | 70.000 | Mítica | Preço proibitivo | **32.000** |
| `arena_portal_galactico` | Portal Quântico dos Descobrimentos | 110.000 | Mítica | Preço proibitivo | **38.000** |
| `arena_cyber_laboratorio` | Laboratório de Matriz Quântica | 26.000 | Mítica | Dentro da faixa | **28.000** |
| `arena_megalopolis_lusa` | Megalópole Atlântica 2077 | 95.000 | Mítica | Preço proibitivo | **35.000** |
| `arena_portugal_ao_contrario` | Portugal Invertido | 27.000 | Mítica | Dentro da faixa | **29.000** |
| `arena_caos_patos` | Ria de Aveiro & Moliceiros Cyber | 12.000 | Épica | Fora da faixa | **10.500** |
| `arena_dentro_cerebro` | Sinapses do Saber Absoluto | 65.000 | Mítica | Preço proibitivo | **34.000** |
| `arena_dimensao_psicadelica` | Vórtice Onírico Transcendente | 28.000 | Mítica | Dentro da faixa | **30.000** |
| `arena_labirinto_onirico` | Labirinto Sem Fim das Quinas | 68.000 | Mítica | Preço proibitivo | **33.000** |
| `arena_excl_campeao` | Trono Sagrado do Campeão Nacional | null | Exclusiva | Mérito (Top 1 Nacional) | **POR MÉRITO** |
| `arena_excl_fundadores` | Monumento Perpétuo dos Fundadores | null | Exclusiva | Mérito (Fundador) | **POR MÉRITO** |
| `arena_excl_lenda_100` | Coliseu dos Imortais — 100 Vitórias | null | Exclusiva | Mérito (100 Vitórias 1v1) | **POR MÉRITO** |

---

### Categoria D: Ajudas & Utilidades (Consumíveis de Gameplay)

| Item ID | Nome da Ajuda | Configuração Anterior | Problemas Detectados | Nova Configuração Canónica SSOT |
|---|---|---|---|---|
| `aid_50_50` | **Pack x5 Ajudas 50/50** | Preço: 1.800 moedas por 1 un. (em `loja/page.tsx`) / maxOwned: 3 | Preço exorbitante; venda de 1 un.; maxOwned irrealista | **Preço: 🪙 750 Moedas (Pack x5) · maxOwned: 50** |
| `aid_public_vote` | **Pack x3 Pergunta ao Público** | Preço: 5.000 moedas por 1 un. (id: `HELP_005`) / maxOwned: 2 | Preço de 5k moedas por 1 voto; sem lógica de pack | **Preço: 🪙 600 Moedas (Pack x3) · maxOwned: 50** |
| `aid_freeze_time` | **Pack x3 Congelar Tempo** | Preço: 4.500 moedas por 1 un. / maxOwned: 2 | Preço de 4.5k por 1 pausa de 15s; mutação direta cliente | **Preço: 🪙 900 Moedas (Pack x3) · maxOwned: 50** |
| `aid_hint` | **Pack x3 Pista Inteligente** | Preço: 750 moedas por 1 un. / maxOwned: 3 | Venda individual de 1 unidade em vez de pack | **Preço: 🪙 750 Moedas (Pack x3) · maxOwned: 50** |
| `aid_second_chance` | **Pack x3 Segunda Oportunidade** | Não existia na Loja | Ajuda essencial de gameplay em falta | **Preço: 🪙 1.250 Moedas (Pack x3) · maxOwned: 50** |
| `aid_triple_elimination`| **Pack x3 Eliminação Tripla** | Não existia na Loja | Ajuda em falta | **Preço: 🪙 1.500 Moedas (Pack x3) · maxOwned: 50** |
| `aid_fast_answer` | **Pack x3 Resposta Rápida** | Não existia na Loja | Ajuda em falta | **Preço: 🪙 1.000 Moedas (Pack x3) · maxOwned: 50** |
| `aid_streak_protection`| **Pack x1 Proteção de Sequência**| Preço: 12.500 moedas por 1 un. | Preço desproporcional | **Preço: 🪙 2.500 Moedas (Pack x1) · maxOwned: 10** |

---

### Categoria E: Provocações & Reações 1v1

| Item ID | Texto / Reação | Preço Anterior | Problema / Anomalia | Novo Preço Canónico |
|---|---|---|---|---|
| `emote_ola` | 👋 Olá! | 0 | Gratuito | **0 (GRÁTIS)** |
| `emote_boa_sorte` | 🍀 Boa sorte! | 0 | Gratuito | **0 (GRÁTIS)** |
| `emote_vamos` | 🔥 Vamos! | 0 | Gratuito | **0 (GRÁTIS)** |
| `emote_boa` | 👏 Boa! | 0 | Gratuito | **0 (GRÁTIS)** |
| `emote_quase` | 😅 Quase! | 0 | Gratuito | **0 (GRÁTIS)** |
| `emote_gg` | 🏆 GG! | 0 | Gratuito | **0 (GRÁTIS)** |
| `PROV_010` | 👑 Quem manda aqui soy yoo | 16.000 Moedas | Preço inflacionado (16.000) para 1 reação | **2.500 Moedas** |
| `pack_basico` | Pack Básico (6 Reações) | 0 | Gratuito | **0 (GRÁTIS)** |
| `pack_pressao` | Guerra Psicológica & Pressão | 16.000 Moedas | Preço inflacionado | **3.500 Moedas** |
| `pack_bairrismo`| Bairrismo & Orgulho Distrital | 22.000 Moedas | Preço inflacionado | **3.500 Moedas** |
| `pack_nostalgia`| Saudades & Nostalgia Lusitana | 18.000 Moedas | Preço inflacionado | **4.000 Moedas** |
| `pack_futebol` | Bancada do Dérbi & Futebol | 20.000 Moedas | Preço inflacionado | **4.500 Moedas** |
| `pack_glitch` | Glitch Cyberpunk & Provocações | 24.000 Moedas | Preço inflacionado | **5.000 Moedas** |
| `pack_descobrimentos`| Caravelas & Conquistas | 25.000 Moedas | Preço inflacionado | **6.000 Moedas** |

---

### Categoria F: Exclusivos VIP (€ Real)

| Item ID | Nome do Produto | Moeda | Preço Real (€) | Tipo de Entitlement | Verificação de Pay-to-Win |
|---|---|---|---|---|---|
| `vip_avatar_001` a `006` | 6 Avatares Imperiais VIP | EUR | €9,99 a €14,99 | Permanente | **0% P2W (Apenas cosmético)** |
| `vip_frame_001` a `006` | 6 Molduras Animadas VIP | EUR | €4,99 a €9,99 | Permanente | **0% P2W (Apenas cosmético)** |
| `vip_title_001` a `008` | 8 Títulos de Prestígio VIP | EUR | €2,99 a €4,99 | Permanente | **0% P2W (Apenas cosmético)** |
| `vip_arena_001` a `006` | 6 Arenas Especiais VIP | EUR | €3,99 a €7,99 | Permanente | **0% P2W (Apenas cosmético)** |
| `vip_emote_001` a `008` | 8 Emotes VIP Exclusivos | EUR | €0,99 a €1,99 | Permanente | **0% P2W (Apenas cosmético)** |
| `vip_pack_001` a `004` | 4 Taunt Packs VIP | EUR | €3,99 a €6,99 | Permanente | **0% P2W (Apenas cosmético)** |

---

## 3. AUDITORIA DA VELOCIDADE DE GANHO DE MOEDAS

Com base no código-fonte em `src/data/economy.ts`, `app/api/quiz/complete/route.ts`, `lib/daily-reward.ts` e `src/data/achievements.ts`:

### Taxas Reais de Ganho:
- **Bónus Inicial de Registo:** 50 moedas.
- **Partida Normal (10 perguntas, Dificuldade 1):**
  - Fórmula: `Math.round((15 * (correct / 10) + perfectBonus + streakBonus) * multiplier)`
  - Média de acertos (7/10): ~14 moedas.
  - Partida Perfeita (10/10 com streak): ~30 moedas.
  - Em Dificuldade 3 com bónus: ~45 moedas.
- **Subida de Nível:** 25 moedas por nível.
- **Recompensa Diária (7 dias):** 25 + 0 + 0 + 50 + 0 + 0 + 100 = 175 moedas/semana (~25 moedas/dia).
- **Conquistas:** Fundo acumulado total de mais de 380.000 moedas distribuído por 32 conquistas escalonadas (750 a 50.000 moedas por marco).

### Tabela de Tempo e Partidas para Atingir Metas de Preço:

| Preço do Item (🪙) | Partidas Necessárias (média 20 moedas) | Tempo de Jogo (~1,8 min/partida) | Dias (Jogador Casual: 3 jogos/dia) | Dias (Jogador Regular: 10 jogos/dia) | Dias (Jogador Competitivo: 25 jogos/dia) |
|---|---|---|---|---|---|
| **500** | 25 | ~45 min | ~5 dias | ~1,5 dias | ~8 horas |
| **1.000** | 50 | ~1,5 horas | ~10 dias | ~3 dias | ~1,2 dias |
| **2.500** | 125 | ~3,7 horas | ~25 dias | ~7 dias | ~3 dias |
| **5.000** | 250 | ~7,5 horas | ~50 dias | ~15 dias | ~6 dias |
| **10.000** | 500 | ~15 horas | ~3 meses | ~30 dias | ~12 dias |
| **25.000** | 1.250 | ~37,5 horas | ~7 meses | ~2,5 meses | ~1 mês |
| **50.000** | 2.500 | ~75 horas | Longo prazo | ~5 meses | ~2 meses |

*(Nota: Estes cálculos consideram apenas partidas regulares. A inclusão de conquistas acelera em 40% a 70% a progressão inicial).*

---

## 4. CONCLUSÃO DA AUDITORIA

A fragmentação detetada exigia a extinção imediata de todos os ficheiros com tabelas de preços dispersas e a imposição de uma **ÚNICA FONTE DE VERDADE** (`SHOP_CATALOG`), consumida por um endpoint autoritativo com idempotência e transações Firestore atómicas (`/api/shop/purchase`).
