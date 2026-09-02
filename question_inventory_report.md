# 🇵🇹 ACORDA PORTUGAL — RELATÓRIO FORENSE DO BANCO DE PERGUNTAS

**Data de Execução:** 02/09/2026 12:05:38
**Motor Auditado:** `QuestionRegistry` & `questionEngine` (Runtime de Produção)
**Total de Ficheiros Auditados:** 24
**Método:** Execução direta determinística (sem estimativas, sem contadores hardcoded).

---

## 1. IDENTIFICAÇÃO DA FONTE CANÓNICA

O jogo **Acorda Portugal** utiliza uma arquitetura unificada de banco de dados em memória (`QuestionRegistry`), abastecido a partir dos datasets físicos JSON no momento de inicialização e alimentando o motor de seleção Fisher-Yates de alta entropia (`questionEngine`).

### Fontes Físicas Existentes no Projeto:

| Fonte / Ficheiro | Tipo | Perguntas | Estado de Integração |
| :--- | :--- | :---: | :--- |
| `lib/data/categories/portugal.json` | 🔥 Fonte Canónica (18 Temas) | **1250** | Ativo no Runtime |
| `lib/data/categories/futebol-portugues.json` | 🔥 Fonte Canónica (18 Temas) | **1110** | Ativo no Runtime |
| `lib/data/categories/atualidade.json` | 🔥 Fonte Canónica (18 Temas) | **750** | Ativo no Runtime |
| `lib/data/categories/portugal-politico.json` | 🔥 Fonte Canónica (18 Temas) | **950** | Ativo no Runtime |
| `lib/data/categories/empresas-portuguesas.json` | 🔥 Fonte Canónica (18 Temas) | **850** | Ativo no Runtime |
| `lib/data/categories/historia.json` | 🔥 Fonte Canónica (18 Temas) | **1304** | Ativo no Runtime |
| `lib/data/categories/geografia.json` | 🔥 Fonte Canónica (18 Temas) | **905** | Ativo no Runtime |
| `lib/data/categories/ciencia-tecnologia.json` | 🔥 Fonte Canónica (18 Temas) | **918** | Ativo no Runtime |
| `lib/data/categories/cultura.json` | 🔥 Fonte Canónica (18 Temas) | **1324** | Ativo no Runtime |
| `lib/data/categories/gastronomia.json` | 🔥 Fonte Canónica (18 Temas) | **1068** | Ativo no Runtime |
| `lib/data/categories/personalidades.json` | 🔥 Fonte Canónica (18 Temas) | **800** | Ativo no Runtime |
| `lib/data/categories/mundo.json` | 🔥 Fonte Canónica (18 Temas) | **800** | Ativo no Runtime |
| `lib/data/categories/desporto.json` | 🔥 Fonte Canónica (18 Temas) | **830** | Ativo no Runtime |
| `lib/data/categories/humor.json` | 🔥 Fonte Canónica (18 Temas) | **800** | Ativo no Runtime |
| `lib/data/categories/musica.json` | 🔥 Fonte Canónica (18 Temas) | **824** | Ativo no Runtime |
| `lib/data/categories/cinema-tv.json` | 🔥 Fonte Canónica (18 Temas) | **917** | Ativo no Runtime |
| `lib/data/categories/desafio-visual.json` | 🔥 Fonte Canónica (18 Temas) | **750** | Ativo no Runtime |
| `lib/data/categories/modo-maluco.json` | 🔥 Fonte Canónica (18 Temas) | **660** | Ativo no Runtime |
| `src/data/questions_desafio_nacional.json` | ⚡ Fonte Especial Ativa | **2000** | Ativo no Runtime |
| `data/perguntas_vila_real_500.json` | ⚡ Fonte Especial Ativa | **500** | Ativo no Runtime |
| `data/perguntas_modo_maluco_5000.json` | ⚡ Fonte Especial Ativa | **5000** | Ativo no Runtime |
| `lib/data/questions.json` | 📦 Snapshot Consolidado | **12 017** | Não Usado Diretamente |
| `lib/data/questions-backup.json` | 💾 Backup Legado | **332** | Não Usado Diretamente |
| `lib/data/Portugal.json` | 🌱 Seed Inicial | **50** | Não Usado Diretamente |

### Origens Ingeridas pelo Runtime de Produção (`QuestionRegistry`):

```text
SOURCE A (18 Ficheiros de Categorias em lib/data/categories/): 16.810 perguntas
SOURCE B (src/data/questions_desafio_nacional.json):            2.000 perguntas
SOURCE C (data/perguntas_vila_real_500.json):                    500 perguntas
SOURCE D (data/perguntas_modo_maluco_5000.json):               5.000 perguntas
--------------------------------------------------------------------------------
TOTAL BRUTO INGERIDO NO PIPELINE ............................ 24.310 perguntas
```

> **Nota Explicativa sobre `lib/data/questions.json` (12.017 perguntas):**
> `lib/data/questions.json` é uma consolidação histórica anterior de 12.017 perguntas, da qual 12.010 já estão totalmente distribuídas nos ficheiros dedicados das 18 categorias. O runtime oficial carrega os ficheiros especializados das 18 categorias + datasets temáticos, garantindo maior granularidade e ausência de duplicação.

---

## 2. CONTAGEM GLOBAL

```text
======================================================================
CONTAGEM GLOBAL FORENSE
======================================================================
TOTAL DE PERGUNTAS NO DATASET BRUTO ............ 24 310
TOTAL DE PERGUNTAS VÁLIDAS ..................... 24 310
TOTAL DE PERGUNTAS PUBLICADAS / ATIVAS ......... 20 061
TOTAL DE PERGUNTAS JOGÁVEIS NO QUIZ ............ 20 061
TOTAL DE PERGUNTAS DUPLICADAS DESCONTADAS ...... 4249
TOTAL DE PERGUNTAS INVÁLIDAS REJEITADAS ........ 0
TOTAL DE PERGUNTAS SEM CATEGORIA ORIGINAL ...... 0
TOTAL DE PERGUNTAS SEM SUBCATEGORIA ORIGINAL ... 0
======================================================================
```

---

## 3. CONTAGEM EXATA POR CATEGORIA

| Categoria | Total Único | Válidas | Publicadas | Jogáveis | % do Banco |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 🇵🇹 **Portugal** | **3247** | 3247 | 3247 | 3247 | 16.19% |
| 📰 **Atualidade — Portugal Agora** | **750** | 750 | 750 | 750 | 3.74% |
| 🏛️ **Portugal Político** | **950** | 950 | 950 | 950 | 4.74% |
| 🏢 **Empresas Portuguesas** | **850** | 850 | 850 | 850 | 4.24% |
| ⚽ **Futebol Português** | **1110** | 1110 | 1110 | 1110 | 5.53% |
| 👁️ **Desafio Visual** | **750** | 750 | 750 | 750 | 3.74% |
| 🤪 **Modo Maluco** | **1418** | 1418 | 1418 | 1418 | 7.07% |
| 🏺 **História** | **1300** | 1300 | 1300 | 1300 | 6.48% |
| 🌍 **Geografia** | **1405** | 1405 | 1405 | 1405 | 7% |
| 🔬 **Ciência e Tecnologia** | **918** | 918 | 918 | 918 | 4.58% |
| 🎭 **Cultura** | **1324** | 1324 | 1324 | 1324 | 6.6% |
| 🍲 **Gastronomia** | **1068** | 1068 | 1068 | 1068 | 5.32% |
| 🏆 **Desporto** | **830** | 830 | 830 | 830 | 4.14% |
| 😂 **Humor** | **800** | 800 | 800 | 800 | 3.99% |
| 🎵 **Música** | **824** | 824 | 824 | 824 | 4.11% |
| 🎬 **Cinema e Televisão** | **917** | 917 | 917 | 917 | 4.57% |
| 👤 **Personalidades** | **800** | 800 | 800 | 800 | 3.99% |
| 🌐 **Mundo** | **800** | 800 | 800 | 800 | 3.99% |
| **TOTAL GERAL** | **20 061** | **20 061** | **20 061** | **20 061** | **100.00%** |

---

## 4. CONTAGEM COMPLETA POR SUBCATEGORIA (ÁRVORE HIERÁRQUICA)

### 🇵🇹 PORTUGAL (Total: 3247)

```text
PORTUGAL
├── História de Portugal ......................... 2200 perguntas
├── Geografia de Portugal ........................ 55 perguntas
├── Cultura Portuguesa ........................... 553 perguntas
├── Tradições .................................... 2 perguntas
├── Monumentos ................................... 93 perguntas
├── Cidades ...................................... 50 perguntas
├── Vilas e Aldeias .............................. 102 perguntas
├── Praias ....................................... 54 perguntas
├── Regiões ...................................... 85 perguntas
├── Gastronomia Portuguesa ....................... 50 perguntas
├── Personalidades Portuguesas ................... 1 perguntas
└── Curiosidades de Portugal ..................... 2 perguntas
```

### 📰 ATUALIDADE — PORTUGAL AGORA (Total: 750)

```text
ATUALIDADE — PORTUGAL AGORA
├── Política e Governo ........................... 0 perguntas
├── Assembleia da República ...................... 0 perguntas
├── Partidos Políticos ........................... 0 perguntas
├── Líderes Políticos ............................ 0 perguntas
├── Economia ..................................... 642 perguntas
├── Salário Mínimo ............................... 0 perguntas
├── Inflação ..................................... 0 perguntas
├── PIB .......................................... 0 perguntas
├── Emprego ...................................... 0 perguntas
├── Habitação .................................... 0 perguntas
├── Euribor ...................................... 0 perguntas
├── Turismo ...................................... 0 perguntas
├── Empresas Portuguesas ......................... 50 perguntas
├── Cultura ...................................... 0 perguntas
├── Desporto ..................................... 0 perguntas
├── Acontecimentos Nacionais ..................... 8 perguntas
└── Notícias e Factos Verificáveis ............... 50 perguntas
```

### 🏛️ PORTUGAL POLÍTICO (Total: 950)

```text
PORTUGAL POLÍTICO
├── Partidos ..................................... 100 perguntas
├── Representação Parlamentar .................... 0 perguntas
├── Líderes ...................................... 0 perguntas
├── História Política ............................ 0 perguntas
├── Instituições ................................. 9 perguntas
├── Constituição ................................. 691 perguntas
├── Sistema Político ............................. 0 perguntas
├── Eleições ..................................... 0 perguntas
├── Propostas Políticas .......................... 0 perguntas
├── Governos ..................................... 50 perguntas
├── Presidentes da República ..................... 50 perguntas
└── Primeiros-Ministros .......................... 50 perguntas
```

### 🏢 EMPRESAS PORTUGUESAS (Total: 850)

```text
EMPRESAS PORTUGUESAS
├── Empresas ..................................... 0 perguntas
├── Marcas ....................................... 60 perguntas
├── Fundadores ................................... 0 perguntas
├── História Empresarial ......................... 50 perguntas
├── Setores ...................................... 640 perguntas
├── Produtos ..................................... 0 perguntas
├── Serviços ..................................... 0 perguntas
├── Empresas Históricas .......................... 50 perguntas
├── Empresas Atuais .............................. 0 perguntas
├── Empresas Tecnológicas ........................ 50 perguntas
└── Empresas Internacionais Portuguesas .......... 0 perguntas
```

### ⚽ FUTEBOL PORTUGUÊS (Total: 1110)

```text
FUTEBOL PORTUGUÊS
├── Clubes ....................................... 3 perguntas
├── Jogadores .................................... 1 perguntas
├── Jogadoras .................................... 50 perguntas
├── Estádios ..................................... 50 perguntas
├── Competições .................................. 738 perguntas
├── Liga Portuguesa .............................. 50 perguntas
├── Taça de Portugal ............................. 1 perguntas
├── Seleção Nacional ............................. 3 perguntas
├── Futebol Feminino ............................. 50 perguntas
├── Treinadores .................................. 1 perguntas
├── História do Futebol .......................... 62 perguntas
├── Momentos Marcantes ........................... 50 perguntas
├── Dérbis & Clássicos ........................... 50 perguntas
├── Recordes ..................................... 1 perguntas
├── Transferências ............................... 0 perguntas
├── Equipamentos ................................. 0 perguntas
└── Futebol Europeu & Clubes Portugueses ......... 0 perguntas
```

### 👁️ DESAFIO VISUAL (Total: 750)

```text
DESAFIO VISUAL
├── Que lugar é este? ............................ 0 perguntas
├── Quem é esta pessoa? .......................... 0 perguntas
├── Bandeiras .................................... 0 perguntas
├── Brasões ...................................... 50 perguntas
├── Símbolos ..................................... 640 perguntas
├── Gastronomia .................................. 0 perguntas
├── Futebol ...................................... 0 perguntas
├── Estádios ..................................... 0 perguntas
├── Monumentos ................................... 10 perguntas
├── Cidades ...................................... 50 perguntas
├── Praias ....................................... 0 perguntas
├── Vilas e Aldeias .............................. 0 perguntas
├── Onde fica? ................................... 0 perguntas
├── Encontra o detalhe ........................... 0 perguntas
├── Fotografias Históricas ....................... 0 perguntas
├── Imagens de Objetos ........................... 0 perguntas
├── Imagens de Animais ........................... 0 perguntas
├── Imagens de Natureza .......................... 0 perguntas
└── Desafio Visual Maluco ........................ 0 perguntas
```

### 🤪 MODO MALUCO (Total: 1418)

```text
MODO MALUCO
├── Perguntas Absurdas ........................... 142 perguntas
├── Perguntas Inesperadas ........................ 152 perguntas
├── Humor & Rir .................................. 142 perguntas
├── Cultura Popular Insólita ..................... 142 perguntas
├── Regras Aleatórias ............................ 140 perguntas
├── Desafios Rápidos ............................. 140 perguntas
├── Efeitos Especiais ............................ 140 perguntas
├── Modificadores de Jogo ........................ 140 perguntas
├── Perguntas com Lógica Diferente ............... 140 perguntas
└── Modo Caos .................................... 140 perguntas
```

### 🏺 HISTÓRIA (Total: 1300)

```text
HISTÓRIA
├── História de Portugal ......................... 55 perguntas
├── História Mundial ............................. 7 perguntas
├── Reis e Rainhas ............................... 168 perguntas
├── Descobrimentos & Navegações .................. 685 perguntas
├── Batalhas & Conflitos ......................... 111 perguntas
├── Impérios Históricos .......................... 57 perguntas
├── Revoluções ................................... 53 perguntas
├── Implantação da República ..................... 51 perguntas
├── Estado Novo .................................. 1 perguntas
├── 25 de Abril & Cravos ......................... 1 perguntas
├── Personalidades Históricas .................... 0 perguntas
├── Civilizações Antigas ......................... 58 perguntas
├── Idade Média .................................. 50 perguntas
├── Idade Moderna ................................ 0 perguntas
└── História Contemporânea ....................... 3 perguntas
```

### 🌍 GEOGRAFIA (Total: 1405)

```text
GEOGRAFIA
├── Geografia de Portugal ........................ 663 perguntas
├── Europa ....................................... 0 perguntas
├── Mundo ........................................ 1 perguntas
├── Países ....................................... 8 perguntas
├── Capitais ..................................... 55 perguntas
├── Grandes Cidades .............................. 1 perguntas
├── Rios ......................................... 7 perguntas
├── Montanhas & Serras ........................... 65 perguntas
├── Ilhas & Arquipélagos ......................... 4 perguntas
├── Oceanos & Mares .............................. 596 perguntas
├── Fronteiras & Tratados ........................ 4 perguntas
├── Regiões ...................................... 1 perguntas
├── Mapas & Cartografia .......................... 0 perguntas
└── Localização Geográfica ....................... 0 perguntas
```

### 🔬 CIÊNCIA E TECNOLOGIA (Total: 918)

```text
CIÊNCIA E TECNOLOGIA
├── Ciência Geral ................................ 8 perguntas
├── Física ....................................... 4 perguntas
├── Química ...................................... 3 perguntas
├── Biologia ..................................... 694 perguntas
├── Astronomia & Espaço .......................... 4 perguntas
├── Corpo Humano ................................. 53 perguntas
├── Animais & Natureza ........................... 50 perguntas
├── Tecnologia ................................... 0 perguntas
├── Informática & Internet ....................... 0 perguntas
├── Inteligência Artificial ...................... 0 perguntas
├── Invenções .................................... 50 perguntas
└── Descobertas Científicas ...................... 52 perguntas
```

### 🎭 CULTURA (Total: 1324)

```text
CULTURA
├── Cultura Portuguesa ........................... 54 perguntas
├── Cultura Mundial .............................. 100 perguntas
├── Arte, Pintura e Escultura .................... 257 perguntas
├── Literatura ................................... 709 perguntas
├── Teatro ....................................... 51 perguntas
├── Fotografia ................................... 0 perguntas
├── Música Erudita & Tradicional ................. 0 perguntas
├── Cinema de Autor .............................. 0 perguntas
├── Televisão Cultural ........................... 0 perguntas
├── Cultura Popular .............................. 102 perguntas
└── Tradições & Folclore ......................... 51 perguntas
```

### 🍲 GASTRONOMIA (Total: 1068)

```text
GASTRONOMIA
├── Gastronomia Portuguesa ....................... 0 perguntas
├── Pratos Típicos Portugueses ................... 178 perguntas
├── Doces & Sobremesas Tradicionais .............. 3 perguntas
├── Bebidas & Vinhos de Portugal ................. 57 perguntas
├── Ingredientes & Especiarias ................... 763 perguntas
├── Receitas Tradicionais ........................ 17 perguntas
├── Regiões Gastronómicas ........................ 50 perguntas
├── Gastronomia Mundial .......................... 0 perguntas
├── Comida Internacional ......................... 0 perguntas
├── Identificação Visual de Pratos ............... 0 perguntas
└── Curiosidades Gastronómicas ................... 0 perguntas
```

### 🏆 DESPORTO (Total: 830)

```text
DESPORTO
├── Futebol Geral ................................ 13 perguntas
├── Atletismo & Maratonas ........................ 642 perguntas
├── Ténis ........................................ 1 perguntas
├── Ciclismo & Volta a Portugal .................. 3 perguntas
├── Basquetebol & NBA ............................ 0 perguntas
├── Fórmula 1 & Motores .......................... 52 perguntas
├── Surf & Ondas Gigantes ........................ 0 perguntas
├── Natação & Desportos Aquáticos ................ 51 perguntas
├── Jogos Olímpicos .............................. 2 perguntas
├── Artes Marciais & Judo ........................ 1 perguntas
├── Motociclismo & MotoGP ........................ 0 perguntas
├── Desporto Português ........................... 65 perguntas
├── Desporto Internacional ....................... 0 perguntas
├── Recordes Mundiais ............................ 0 perguntas
└── Grandes Competições .......................... 0 perguntas
```

### 😂 HUMOR (Total: 800)

```text
HUMOR
├── Humor Português .............................. 50 perguntas
├── Expressões Populares Portuguesas ............. 650 perguntas
├── Memes & Internet ............................. 50 perguntas
├── Comédia na TV & Cinema ....................... 50 perguntas
├── Situações do Quotidiano ...................... 0 perguntas
├── Perguntas Engraçadas ......................... 0 perguntas
├── Curiosidades Hilariantes ..................... 0 perguntas
└── Humor Absurdo ................................ 0 perguntas
```

### 🎵 MÚSICA (Total: 824)

```text
MÚSICA
├── Música Portuguesa ............................ 13 perguntas
├── Fado & Guitarra Portuguesa ................... 3 perguntas
├── Música Popular & Pimba ....................... 50 perguntas
├── Artistas & Cantores Portugueses .............. 50 perguntas
├── Bandas Portuguesas ........................... 50 perguntas
├── Música Internacional ......................... 6 perguntas
├── Artistas Internacionais ...................... 0 perguntas
├── Bandas Internacionais Lendárias .............. 0 perguntas
├── Grandes Canções .............................. 0 perguntas
├── Álbuns Históricos ............................ 0 perguntas
├── Instrumentos Musicais ........................ 638 perguntas
├── História da Música ........................... 14 perguntas
└── Festivais de Música .......................... 0 perguntas
```

### 🎬 CINEMA E TELEVISÃO (Total: 917)

```text
CINEMA E TELEVISÃO
├── Grandes Filmes ............................... 2 perguntas
├── Séries Marcantes ............................. 2 perguntas
├── Atores e Atrizes ............................. 4 perguntas
├── Personagens Inesquecíveis .................... 0 perguntas
├── Realizadores ................................. 2 perguntas
├── Cinema Português ............................. 63 perguntas
├── Televisão Portuguesa ......................... 744 perguntas
├── Programas de Televisão Clássicos ............. 50 perguntas
├── Streaming & Novas Séries ..................... 0 perguntas
├── Cultura Pop & Geek ........................... 0 perguntas
└── Filmes Clássicos ............................. 50 perguntas
```

### 👤 PERSONALIDADES (Total: 800)

```text
PERSONALIDADES
├── Figuras Históricas ........................... 9 perguntas
├── Políticos & Estadistas ....................... 691 perguntas
├── Artistas & Pintores .......................... 50 perguntas
├── Atletas Lendários ............................ 0 perguntas
├── Cientistas & Pensadores ...................... 50 perguntas
├── Empresários & Empreendedores ................. 0 perguntas
├── Escritores & Poetas .......................... 0 perguntas
├── Músicos & Compositores ....................... 0 perguntas
├── Atores & Intérpretes ......................... 0 perguntas
├── Criadores & Inovadores ....................... 0 perguntas
├── Personalidades Internacionais ................ 0 perguntas
└── Personalidades Portuguesas ................... 0 perguntas
```

### 🌐 MUNDO (Total: 800)

```text
MUNDO
├── Países & Continentes ......................... 691 perguntas
├── Capitais do Mundo ............................ 50 perguntas
├── História Mundial ............................. 0 perguntas
├── Geografia Mundial ............................ 50 perguntas
├── Culturas & Costumes Globais .................. 9 perguntas
├── Ciência & Tecnologia no Mundo ................ 0 perguntas
├── Economia Global .............................. 0 perguntas
├── Desporto Mundial ............................. 0 perguntas
├── Música do Mundo .............................. 0 perguntas
├── Cinema Internacional ......................... 0 perguntas
├── Personalidades do Mundo ...................... 0 perguntas
├── Curiosidades Mundiais ........................ 0 perguntas
└── Atualidade Internacional ..................... 0 perguntas
```

---

## 5. DETEÇÃO DE CATEGORIAS E SUBCATEGORIAS VAZIAS

```text
CATEGORIAS COM 0 PERGUNTAS ................. 0
SUBCATEGORIAS COM 0 PERGUNTAS .............. 95
CATEGORIAS NO FRONTEND SEM PERGUNTAS ....... 0
CATEGORIAS NO DATASET SEM FRONTEND ......... 0
```

### 🚨 Lista de Subcategorias Vazias (0 Perguntas):

- **Atualidade — Portugal Agora** → `Política e Governo` (ID: `politica-governo`)
- **Atualidade — Portugal Agora** → `Assembleia da República` (ID: `assembleia-republica`)
- **Atualidade — Portugal Agora** → `Partidos Políticos` (ID: `partidos-politicos`)
- **Atualidade — Portugal Agora** → `Líderes Políticos` (ID: `lideres-politicos`)
- **Atualidade — Portugal Agora** → `Salário Mínimo` (ID: `salario-minimo`)
- **Atualidade — Portugal Agora** → `Inflação` (ID: `inflacao`)
- **Atualidade — Portugal Agora** → `PIB` (ID: `pib`)
- **Atualidade — Portugal Agora** → `Emprego` (ID: `emprego`)
- **Atualidade — Portugal Agora** → `Habitação` (ID: `habitacao`)
- **Atualidade — Portugal Agora** → `Euribor` (ID: `euribor`)
- **Atualidade — Portugal Agora** → `Turismo` (ID: `turismo`)
- **Atualidade — Portugal Agora** → `Cultura` (ID: `cultura-atual`)
- **Atualidade — Portugal Agora** → `Desporto` (ID: `desporto-atual`)
- **Portugal Político** → `Representação Parlamentar` (ID: `representacao-parlamentar`)
- **Portugal Político** → `Líderes` (ID: `lideres`)
- **Portugal Político** → `História Política` (ID: `historia-politica`)
- **Portugal Político** → `Sistema Político` (ID: `sistema-politico`)
- **Portugal Político** → `Eleições` (ID: `eleicoes`)
- **Portugal Político** → `Propostas Políticas` (ID: `propostas-politicas`)
- **Empresas Portuguesas** → `Empresas` (ID: `empresas`)
- **Empresas Portuguesas** → `Fundadores` (ID: `fundadores`)
- **Empresas Portuguesas** → `Produtos` (ID: `produtos`)
- **Empresas Portuguesas** → `Serviços` (ID: `servicos`)
- **Empresas Portuguesas** → `Empresas Atuais` (ID: `empresas-atuais`)
- **Empresas Portuguesas** → `Empresas Internacionais Portuguesas` (ID: `empresas-internacionais`)
- **Futebol Português** → `Transferências` (ID: `transferencias`)
- **Futebol Português** → `Equipamentos` (ID: `equipamentos`)
- **Futebol Português** → `Futebol Europeu & Clubes Portugueses` (ID: `futebol-europeu`)
- **Desafio Visual** → `Que lugar é este?` (ID: `que-lugar-e-este`)
- **Desafio Visual** → `Quem é esta pessoa?` (ID: `quem-e-esta-pessoa`)
- **Desafio Visual** → `Bandeiras` (ID: `bandeiras`)
- **Desafio Visual** → `Gastronomia` (ID: `gastronomia-visual`)
- **Desafio Visual** → `Futebol` (ID: `futebol-visual`)
- **Desafio Visual** → `Estádios` (ID: `estadios-visual`)
- **Desafio Visual** → `Praias` (ID: `praias-visual`)
- **Desafio Visual** → `Vilas e Aldeias` (ID: `vilas-aldeias-visual`)
- **Desafio Visual** → `Onde fica?` (ID: `onde-fica-visual`)
- **Desafio Visual** → `Encontra o detalhe` (ID: `encontra-detalhe`)
- **Desafio Visual** → `Fotografias Históricas` (ID: `fotografias-historicas`)
- **Desafio Visual** → `Imagens de Objetos` (ID: `imagens-objetos`)
- **Desafio Visual** → `Imagens de Animais` (ID: `imagens-animais`)
- **Desafio Visual** → `Imagens de Natureza` (ID: `imagens-natureza`)
- **Desafio Visual** → `Desafio Visual Maluco` (ID: `desafio-visual-maluco`)
- **História** → `Personalidades Históricas` (ID: `personalidades-historicas`)
- **História** → `Idade Moderna` (ID: `idade-moderna`)
- **Geografia** → `Europa` (ID: `geografia-europa`)
- **Geografia** → `Mapas & Cartografia` (ID: `mapas`)
- **Geografia** → `Localização Geográfica` (ID: `localizacao-geografica`)
- **Ciência e Tecnologia** → `Tecnologia` (ID: `tecnologia-geral`)
- **Ciência e Tecnologia** → `Informática & Internet` (ID: `informatica-internet`)
- **Ciência e Tecnologia** → `Inteligência Artificial` (ID: `inteligencia-artificial`)
- **Cultura** → `Fotografia` (ID: `fotografia`)
- **Cultura** → `Música Erudita & Tradicional` (ID: `musica-cultura`)
- **Cultura** → `Cinema de Autor` (ID: `cinema-cultura`)
- **Cultura** → `Televisão Cultural` (ID: `televisao-cultura`)
- **Gastronomia** → `Gastronomia Portuguesa` (ID: `gastronomia-portuguesa-geral`)
- **Gastronomia** → `Gastronomia Mundial` (ID: `gastronomia-mundial`)
- **Gastronomia** → `Comida Internacional` (ID: `comida-internacional`)
- **Gastronomia** → `Identificação Visual de Pratos` (ID: `identificacao-visual-pratos`)
- **Gastronomia** → `Curiosidades Gastronómicas` (ID: `curiosidades-gastronomicas`)
- **Desporto** → `Basquetebol & NBA` (ID: `basquetebol`)
- **Desporto** → `Surf & Ondas Gigantes` (ID: `surf`)
- **Desporto** → `Motociclismo & MotoGP` (ID: `motociclismo`)
- **Desporto** → `Desporto Internacional` (ID: `desporto-internacional`)
- **Desporto** → `Recordes Mundiais` (ID: `recordes-desportivos`)
- **Desporto** → `Grandes Competições` (ID: `competicoes-desportivas`)
- **Humor** → `Situações do Quotidiano` (ID: `situacoes-quotidiano`)
- **Humor** → `Perguntas Engraçadas` (ID: `perguntas-engracadas`)
- **Humor** → `Curiosidades Hilariantes` (ID: `curiosidades-engracadas`)
- **Humor** → `Humor Absurdo` (ID: `modo-maluco-humor`)
- **Música** → `Artistas Internacionais` (ID: `artistas-internacionais`)
- **Música** → `Bandas Internacionais Lendárias` (ID: `bandas-internacionais`)
- **Música** → `Grandes Canções` (ID: `cancoes`)
- **Música** → `Álbuns Históricos` (ID: `albuns`)
- **Música** → `Festivais de Música` (ID: `festivais-musica`)
- **Cinema e Televisão** → `Personagens Inesquecíveis` (ID: `personagens`)
- **Cinema e Televisão** → `Streaming & Novas Séries` (ID: `streaming`)
- **Cinema e Televisão** → `Cultura Pop & Geek` (ID: `cultura-pop`)
- **Personalidades** → `Atletas Lendários` (ID: `atletas`)
- **Personalidades** → `Empresários & Empreendedores` (ID: `empresarios`)
- **Personalidades** → `Escritores & Poetas` (ID: `escritores`)
- **Personalidades** → `Músicos & Compositores` (ID: `musicos`)
- **Personalidades** → `Atores & Intérpretes` (ID: `atores`)
- **Personalidades** → `Criadores & Inovadores` (ID: `criadores`)
- **Personalidades** → `Personalidades Internacionais` (ID: `personalidades-internacionais`)
- **Personalidades** → `Personalidades Portuguesas` (ID: `personalidades-portuguesas`)
- **Mundo** → `História Mundial` (ID: `historia-mundial-geral`)
- **Mundo** → `Ciência & Tecnologia no Mundo` (ID: `ciencia-tecnologia-mundo`)
- **Mundo** → `Economia Global` (ID: `economia-mundo`)
- **Mundo** → `Desporto Mundial` (ID: `desporto-mundo`)
- **Mundo** → `Música do Mundo` (ID: `musica-mundo`)
- **Mundo** → `Cinema Internacional` (ID: `cinema-mundo`)
- **Mundo** → `Personalidades do Mundo` (ID: `personalidades-mundo`)
- **Mundo** → `Curiosidades Mundiais` (ID: `curiosidades-mundo`)
- **Mundo** → `Atualidade Internacional` (ID: `atualidade-internacional`)

---

## 6. MAPA DE IDs CANÓNICOS DE CATEGORIA

| ID Canónico | Nome Oficial | Slug Canónico | Ícone | Total Perguntas |
| :--- | :--- | :--- | :---: | :---: |
| `portugal` | Portugal | `portugal` | 🇵🇹 | 3247 |
| `atualidade` | Atualidade — Portugal Agora | `atualidade` | 📰 | 750 |
| `portugal-politico` | Portugal Político | `portugal-politico` | 🏛️ | 950 |
| `empresas-portuguesas` | Empresas Portuguesas | `empresas-portuguesas` | 🏢 | 850 |
| `futebol-portugues` | Futebol Português | `futebol-portugues` | ⚽ | 1110 |
| `desafio-visual` | Desafio Visual | `desafio-visual` | 👁️ | 750 |
| `modo-maluco` | Modo Maluco | `modo-maluco` | 🤪 | 1418 |
| `historia` | História | `historia` | 🏺 | 1300 |
| `geografia` | Geografia | `geografia` | 🌍 | 1405 |
| `ciencia-tecnologia` | Ciência e Tecnologia | `ciencia-tecnologia` | 🔬 | 918 |
| `cultura` | Cultura | `cultura` | 🎭 | 1324 |
| `gastronomia` | Gastronomia | `gastronomia` | 🍲 | 1068 |
| `desporto` | Desporto | `desporto` | 🏆 | 830 |
| `humor` | Humor | `humor` | 😂 | 800 |
| `musica` | Música | `musica` | 🎵 | 824 |
| `cinema-tv` | Cinema e Televisão | `cinema-tv` | 🎬 | 917 |
| `personalidades` | Personalidades | `personalidades` | 👤 | 800 |
| `mundo` | Mundo | `mundo` | 🌐 | 800 |

---

## 7. DETEÇÃO DE PERGUNTAS DUPLICADAS

```text
TOTAL DE DUPLICADOS EXPULSOS DO RUNTIME ....... 4249
- Duplicados Exatos (Texto + 4 Opções) ........ 4242
- Duplicados por Texto de Pergunta ............. 4243
- Duplicados Quase Idênticos (Semânticos) ...... 4249
- Duplicados por questionId .................... 0
```

### Amostra de Duplicados Detetados e Neutralizados:
1. **[DUPLICADO_QUASE_IDENTICO]** `historia_0086` em `historia.json` vs `historia_0059` em `historia.json`
   > "Em que ano iniciou o seu reinado ou governação o rei português D. João V?"
2. **[DUPLICADO_QUASE_IDENTICO]** `historia_0087` em `historia.json` vs `historia_0060` em `historia.json`
   > "Qual foi a principal marca histórica deixada pelo monarca português D. João V?"
3. **[DUPLICADO_QUASE_IDENTICO]** `historia_0100` em `historia.json` vs `historia_0055` em `historia.json`
   > "Em que ano iniciou o seu reinado ou governação o rei português D. Pedro V?"
4. **[DUPLICADO_QUASE_IDENTICO]** `historia_0101` em `historia.json` vs `historia_0056` em `historia.json`
   > "Qual foi a principal marca histórica deixada pelo monarca português D. Pedro V?"
5. **[DUPLICADO_EXATO]** `modo-maluco_0020` em `modo-maluco.json` vs `modo-maluco_0019` em `modo-maluco.json`
   > "Se um galo botar um ovo exatamente no cimo de um telhado pontiagudo entre Portugal e Espanha, para que lado cai o ovo?"
6. **[DUPLICADO_EXATO]** `modo-maluco_0021` em `modo-maluco.json` vs `modo-maluco_0019` em `modo-maluco.json`
   > "Se um galo botar um ovo exatamente no cimo de um telhado pontiagudo entre Portugal e Espanha, para que lado cai o ovo?"
7. **[DUPLICADO_EXATO]** `modo-maluco_0022` em `modo-maluco.json` vs `modo-maluco_0019` em `modo-maluco.json`
   > "Se um galo botar um ovo exatamente no cimo de um telhado pontiagudo entre Portugal e Espanha, para que lado cai o ovo?"
8. **[DUPLICADO_EXATO]** `modo-maluco_0023` em `modo-maluco.json` vs `modo-maluco_0019` em `modo-maluco.json`
   > "Se um galo botar um ovo exatamente no cimo de um telhado pontiagudo entre Portugal e Espanha, para que lado cai o ovo?"
9. **[DUPLICADO_EXATO]** `modo-maluco_0024` em `modo-maluco.json` vs `modo-maluco_0019` em `modo-maluco.json`
   > "Se um galo botar um ovo exatamente no cimo de um telhado pontiagudo entre Portugal e Espanha, para que lado cai o ovo?"
10. **[DUPLICADO_EXATO]** `modo-maluco_0025` em `modo-maluco.json` vs `modo-maluco_0019` em `modo-maluco.json`
   > "Se um galo botar um ovo exatamente no cimo de um telhado pontiagudo entre Portugal e Espanha, para que lado cai o ovo?"

---

## 8. VALIDAÇÃO DE PERGUNTAS JOGÁVEIS

```text
TOTAL ANALISADO NO PIPELINE ................... 24 310
VALIDADAS ..................................... 24 310
JOGÁVEIS NO QUIZSCREEN (100% ESTRUTURA OK) .... 20 061
REJEITADAS POR INVALIDEZ ESTRUTURAL ........... 0
```

---

## 9. CRUZAMENTO COM O PERFIL DO JOGADOR

O perfil do utilizador (`app/perfil/page.tsx` e `lib/category-registry.ts`) calcula o domínio das 6 Categorias Mestres através da função determinística `getCanonicalCategoryData()`:

| Categoria Mestre Perfil | ID Canónico | Perguntas Disponíveis no Banco | Métricas do Perfil |
| :--- | :--- | :---: | :--- |
| **História de Portugal** | `historia` | **1300** | Disponíveis vs Respondidas vs Corretas (%) |
| **Geografia & Território** | `geografia` | **1405** | Disponíveis vs Respondidas vs Corretas (%) |
| **Desporto Nacional** | `desporto` | **1940** | Disponíveis vs Respondidas vs Corretas (%) |
| **Cultura & Tradições** | `cultura` | **3065** | Disponíveis vs Respondidas vs Corretas (%) |
| **Símbolos & Gastronomia** | `simbolos` | **4315** | Disponíveis vs Respondidas vs Corretas (%) |
| **Modo Maluco** | `maluco` | **2218** | Disponíveis vs Respondidas vs Corretas (%) |

> **Garantia Arquitetural:** O perfil do jogador **NUNCA** confunde o número total de perguntas disponíveis no jogo com o número de perguntas que o jogador já respondeu.

---

## 10. CRUZAMENTO EDITORIAL (METAS VS REAL)

```text
EDITORIAL TARGET GLOBAL (233 Subtemas × 2.000) .. 466.000
QUESTÕES BRUTAS GERADAS / ARQUIVADAS .......... 24 310
QUESTÕES VÁLIDAS ESTRUTURALMENTE .............. 24 310
QUESTÕES APROVADAS E DEDUPLICADAS ............. 20 061
QUESTÕES PUBLICADAS E ATIVAS NO JOGO .......... 20 061
QUESTÕES 100% JOGÁVEIS NO QUIZSCREEN .......... 20 061
```

---

## 11. TABELA FINAL RESUMO

```text
========================================
ACORDA PORTUGAL
INVENTÁRIO REAL DE PERGUNTAS
========================================

TOTAL REALMENTE JOGÁVEL ...... 20 061

PORTUGAL ..................... 3247
FUTEBOL PORTUGUÊS ............ 1110
HISTÓRIA ..................... 1300
CULTURA ...................... 1324
GASTRONOMIA .................. 1068
PORTUGAL POLÍTICO ............ 950
GEOGRAFIA .................... 1405
CIÊNCIA E TECNOLOGIA ......... 918
EMPRESAS PORTUGUESAS ......... 850
DESPORTO ..................... 830
MÚSICA ....................... 824
CINEMA E TELEVISÃO ........... 917
HUMOR ........................ 800
PERSONALIDADES ............... 800
MUNDO ........................ 800
ATUALIDADE ................... 750
DESAFIO VISUAL ............... 750
MODO MALUCO .................. 1418

TOTAL CATEGORIAS ............. 18
TOTAL SUBCATEGORIAS .......... 233
========================================
```
