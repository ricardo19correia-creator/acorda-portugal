/**
 * 🇵🇹 ACORDA PORTUGAL — POOL FACTUAL EXPANDIDO DE ALTA ENTROPIA
 * 
 * Biblioteca enciclopédica canónica com centenas de factos rigorosos e verificados
 * cobrindo todas as 20 categorias e 236 subcategorias do jogo.
 */

// 1. POLÍTICA E ATUALIDADE DE PORTUGAL
const POLITICA_FACTOS = [
  { tema: 'Presidentes da República', figura: 'Marcelo Rebelo de Sousa', cargo: 'Presidente da República', detalhe: 'Eleito em 2016 e reeleito em 2021 à primeira volta pelo sufrágio universal direto' },
  { tema: 'Presidentes da República', figura: 'Aníbal Cavaco Silva', cargo: 'Presidente da República', detalhe: 'Exerceu a Presidência da República durante dois mandatos (2006-2016) e foi Primeiro-Ministro durante uma década' },
  { tema: 'Presidentes da República', figura: 'Jorge Sampaio', cargo: 'Presidente da República', detalhe: 'Presidente entre 1996 e 2006, foi também Presidente da Câmara Municipal de Lisboa e Alto Representante da ONU' },
  { tema: 'Presidentes da República', figura: 'Mário Soares', cargo: 'Presidente da República', detalhe: 'Histórico líder fundador do Partido Socialista, Primeiro-Ministro que assinou a adesão à CEE em 1985 e Presidente de 1986 a 1996' },
  { tema: 'Presidentes da República', figura: 'António Ramalho Eanes', cargo: 'Presidente da República', detalhe: 'O primeiro Presidente da República democraticamente eleito por sufrágio universal direto após o 25 de Abril, em 1976' },
  { tema: 'Presidentes da República', figura: 'Manuel de Arriaga', cargo: 'Primeiro Presidente Constitucional da República', detalhe: 'Eleito pela Assembleia Nacional Constituinte em 1911 após a implantação da República' },
  { tema: 'Presidentes da República', figura: 'Teófilo Braga', cargo: 'Presidente do Governo Provisório', detalhe: 'Ilustre escritor e filósofo que liderou o Governo Provisório da República entre 1910 e 1911' },
  { tema: 'Instituições Democráticas', figura: 'Assembleia da República', cargo: 'Parlamento Nacional', detalhe: 'Órgão legislativo unicameral de Portugal sediado no Palácio de São Bento, composto constitucionalmente por 230 deputados' },
  { tema: 'Instituições Democráticas', figura: 'Tribunal Constitucional', cargo: 'Órgão Jurisdicional', detalhe: 'Tribunal com sede no Palácio Ratton em Lisboa, responsável por fiscalizar a conformidade das leis com a Constituição de 1976' },
  { tema: 'Constituição da República', figura: 'Constituição de 1976', cargo: 'Lei Fundamental', detalhe: 'Aprovada a 2 de abril de 1976 pela Assembleia Constituinte, consagrando o Estado de Direito democrático' },
  { tema: 'Primeiros-Ministros', figura: 'Francisco Sá Carneiro', cargo: 'Primeiro-Ministro', detalhe: 'Fundador do PPD/PSD e líder da Aliança Democrática, falecido tragicamente no acidente de Camarate em 1980' },
  { tema: 'Primeiros-Ministros', figura: 'António Guterres', cargo: 'Primeiro-Ministro e Secretário-Geral da ONU', detalhe: 'Primeiro-Ministro de 1995 a 2002 e Secretário-Geral da Organização das Nações Unidas eleito em 2016' },
];

// 2. EMPRESAS E ECONOMIA PORTUGUESA
const EMPRESAS_FACTOS = [
  { empresa: 'EDP — Energias de Portugal', setor: 'Energia & Renováveis', detalhe: 'Líder nacional do setor elétrico e uma das maiores operadoras globais de energia eólica e solar através da EDP Renováveis' },
  { empresa: 'Galp Energia', setor: 'Petróleo & Energia', detalhe: 'Principal grupo integrado de energia de Portugal, presente na exploração, refinação de Sines e distribuição de combustíveis e eletricidade' },
  { empresa: 'Corticeira Amorim', setor: 'Cortiça & Indústria', detalhe: 'Maior produtora e transformadora mundial de produtos de cortiça, sediada em Santa Maria da Feira' },
  { empresa: 'Jerónimo Martins', setor: 'Grande Distribuição & Retalho', detalhe: 'Grupo centenário proprietário dos supermercados Pingo Doce e Recheio em Portugal, e Biedronka na Polónia' },
  { empresa: 'Sonae', setor: 'Retalho & Telecomunicações', detalhe: 'Grupo fundado na Maia, líder no retalho alimentar com o Continente e com fortes participações nas telecomunicações e centros comerciais' },
  { empresa: 'The Navigator Company', setor: 'Pasta e Papel', detalhe: 'Grande exportadora industrial portuguesa, fabricante global das marcas de papel de escritório Navigator e Soporset' },
  { empresa: 'Vista Alegre', setor: 'Porcelana & Cristal', detalhe: 'Fundada em 1824 em Ílhavo, uma das mais prestigiadas manufaturas de porcelana, faiança e cristal do mundo' },
  { empresa: 'TAP Air Portugal', setor: 'Aviação Comercial', detalhe: 'Companhia aérea de bandeira nacional fundada em 1945, pioneira na ligação transatlântica entre a Europa e o Brasil' },
  { empresa: 'CTT — Correios de Portugal', setor: 'Logística & Correios', detalhe: 'Empresa pública secular com mais de 500 anos de história fundada em 1520 pelo rei D. Manuel I' },
  { empresa: 'Delta Cafés', setor: 'Café & Bebidas', detalhe: 'Marca fundada em Campo Maior (Alentejo) por Rui Nabeiro em 1961, líder incontestada do mercado ibérico de café' },
  { empresa: 'Renova', setor: 'Papel & Bens de Consumo', detalhe: 'Famosa internacionalmente pela inovação com o lançamento pioneiro de papel higiénico de cores (preto, encarnado e azul)' },
  { empresa: 'OutSystems', setor: 'Tecnologia & Software', detalhe: 'Pioneira tecnológica nacional e um dos primeiros «unicórnios» portugueses com plataforma líder mundial de desenvolvimento low-code' },
  { empresa: 'Farfetch', setor: 'Comércio Eletrónico de Luxo', detalhe: 'Primeiro unicórnio de raiz portuguesa cotado na Bolsa de Nova Iorque (NYSE), fundado por José Neves' },
];

// 3. CIÊNCIA, TECNOLOGIA E PENSAMENTO
const CIENCIA_FACTOS = [
  { cientista: 'António Egas Moniz', campo: 'Medicina e Neurocirurgia', detalhe: 'Recebeu o Prémio Nobel da Fisiologia ou Medicina em 1949 pelo desenvolvimento da angiografia cerebral e leucotomia pré-frontal' },
  { cientista: 'Pedro Nunes', campo: 'Matemática e Navegação', detalhe: 'Inventor do nónio no século XVI, instrumento que permitiu medir frações de grau com extrema precisão nas cartas de marear' },
  { cientista: 'Garcia de Orta', campo: 'Botânica e Medicina Tropical', detalhe: 'Autor da obra pioneira «Colóquios dos Simples e Drogas da Índia» publicada em Goa em 1563' },
  { cientista: 'António Damásio', campo: 'Neurociência e Neurologia', detalhe: 'Neurocientista de reputação mundial, autor dos bestsellers «O Erro de Descartes» e «O Sentimento de Si»' },
  { cientista: 'Bento de Jesus Caraça', campo: 'Matemática e Cultura', detalhe: 'Distinto matemático e pedagogo republicano, autor dos célebres «Conceitos Fundamentais da Matemática»' },
  { cientista: 'Fundação Champalimaud', campo: 'Investigação Biomédica', detalhe: 'Centro internacional de excelência sediado em Lisboa na foz do Tejo, especializado em oncologia e neurociências' },
  { cientista: 'Laboratório Ibérico Internacional de Nanotecnologia (INL)', campo: 'Nanotecnologia', detalhe: 'Organização internacional de investigação conjunta entre Portugal e Espanha sediada em Braga' },
];

// 4. MÚSICA E ARTES PERFORMATIVAS
const MUSICA_FACTOS = [
  { artista: 'Amália Rodrigues', genero: 'Fado', detalhe: 'A «Rainha do Fado» e maior embaixadora musical de Portugal, que imortalizou temas como «Barco Negro», «Uma Casa Portuguesa» e «Povo que Lavas no Rio»' },
  { artista: 'Carlos do Carmo', genero: 'Fado', detalhe: 'Célebre fadista lisboeta galardoado com o Grammy Latino de Carreira e impulsionador da elevação do Fado a Património Imaterial da UNESCO' },
  { artista: 'Mariza', genero: 'Fado Contemporâneo', detalhe: 'Uma das mais aclamadas vozes portuguesas internacionais, famosa por temas como «Ó Gente da Minha Terra» e «Chuva»' },
  { artista: 'José Afonso (Zeca Afonso)', genero: 'Música de Intervenção', detalhe: 'Autor de «Grândola, Vila Morena», a senha radiofónica transmitida à meia-noite e vinte do dia 25 de Abril de 1974 na Rádio Renascença' },
  { artista: 'Xutos & Pontapés', genero: 'Rock Português', detalhe: 'Formados em 1979 em Almada por Zé Pedro, Tim, Kalú e João Cabeleira, considerada a banda mais icónica do rock nacional' },
  { artista: 'GNR (Grupo Novo Rock)', genero: 'Pop-Rock', detalhe: 'Banda histórica do Porto liderada pelo carismático vocalista Rui Reininho, célebre por êxitos como «Dunas» e «Pronúncia do Norte»' },
  { artista: 'Salvador Sobral', genero: 'Jazz & Canção', detalhe: 'Venceu o Festival Eurovisão da Canção em Kiev em 2017 com a canção «Amar pelos Dois» composta por Luísa Sobral com pontuação recorde' },
  { artista: 'Madredeus', genero: 'Música Erudita e Popular', detalhe: 'Grupo liderado musicalmente por Pedro Ayres Magalhães com a voz inconfundível de Teresa Salgueiro' },
  { artista: 'Guitarra Portuguesa de Lisboa vs Coimbra', genero: 'Instrumento Tradicional', detalhe: 'A guitarra de Lisboa tem voluta em caracol e afinação própria; a de Coimbra tem voluta em lágrima e afinação um tom abaixo' },
];

// 5. CINEMA E TELEVISÃO PORTUGUESA
const CINEMA_TV_FACTOS = [
  { obra: 'Manoel de Oliveira', tipo: 'Realizador de Cinema', detalhe: 'O realizador mais longevo da história do cinema mundial, ativo até aos 106 anos e autor de obras-primas como «Aniki Bóbó» e «Vale Abraão»' },
  { obra: 'Capitães de Abril', tipo: 'Filme Histórico', detalhe: 'Filme realizado por Maria de Medeiros em 2000 retratando os acontecimentos do golpe militar de 25 de Abril de 1974' },
  { obra: 'O Pátio das Cantigas', tipo: 'Cinema Clássico Português', detalhe: 'Célebre comédia portuguesa de 1942 realizada por Francisco Ribeiro (Ribeirinho), imortalizada pela frase «Ó Evaristo, tens cá disto?»' },
  { obra: 'Herman José', tipo: 'Comediante e Apresentador', detalhe: 'Pioneiro do humor moderno na televisão portuguesa com programas históricos como «O Tal Canal», «Hermanias» e «Herman Enciclopédia»' },
  { obra: 'O Preço Certo', tipo: 'Concurso Televisivo', detalhe: 'O concurso mais duradouro e popular da televisão portuguesa, apresentado diariamente na RTP1 por Fernando Mendes' },
  { obra: 'Vila Faia', tipo: 'Telenovela', detalhe: 'A primeira telenovela portuguesa de produção nacional, estreada pela RTP em 1982 e protagonizada por Nicolau Breyner e Mariana Rey Monteiro' },
];

// 6. DESPORTO OLÍMPICO E MODALIDADES
const DESPORTO_FACTOS = [
  { atleta: 'Carlos Lopes', modalidade: 'Atletismo (Maratona)', feito: 'Conquistou a primeira medalha de ouro olímpica da história de Portugal nos Jogos Olímpicos de Los Angeles em 1984' },
  { atleta: 'Rosa Mota', modalidade: 'Atletismo (Maratona)', feito: 'Conquistou a medalha de ouro na maratona feminina nos Jogos Olímpicos de Seul em 1988 e o ouro europeu e mundial' },
  { atleta: 'Fernanda Ribeiro', modalidade: 'Atletismo (10.000 metros)', feito: 'Conquistou a medalha de ouro olímpica nos 10.000 metros nos Jogos Olímpicos de Atlanta em 1996 com uma ponta final épica' },
  { atleta: 'Nélson Évora', modalidade: 'Atletismo (Triplo Salto)', feito: 'Sagrou-se campeão olímpico de triplo salto nos Jogos Olímpicos de Pequim em 2008' },
  { atleta: 'Pedro Pichardo', modalidade: 'Atletismo (Triplo Salto)', feito: 'Campeão olímpico do triplo salto nos Jogos Olímpicos de Tóquio 2020 com a fantástica marca de 17,98 metros' },
  { atleta: 'Telma Monteiro', modalidade: 'Judo (-57 kg)', feito: 'Uma das atletas mais tituladas da história do judo mundial, conquistou a medalha de bronze olímpica no Rio 2016 e seis títulos de campeã da Europa' },
  { atleta: 'Miguel Oliveira', modalidade: 'Motociclismo (MotoGP)', feito: 'Primeiro piloto português a competir e a vencer corridas na categoria rainha do motociclismo mundial (MotoGP)' },
  { atleta: 'Neemias Queta', modalidade: 'Basquetebol (NBA)', feito: 'Primeiro jogador de basquetebol português a ser draftado e a sagrar-se campeão da NBA pelos Boston Celtics em 2024' },
  { atleta: 'Fernando Pimenta', modalidade: 'Canoagem (K1 / K2)', feito: 'Múltiplo campeão mundial e medalhado olímpico em Londres 2012 e Tóquio 2020 na canoagem de velocidade' },
  { atleta: 'Cristiano Ronaldo', modalidade: 'Futebol Internacional', feito: 'Vencedor de 5 Bolas de Ouro, melhor marcador de sempre de seleções nacionais mundiais e capitão de Portugal no Euro 2016' },
];

// 7. DESAFIO VISUAL & SÍMBOLOS NACIONAIS
const SIMBOLOS_FACTOS = [
  { simbolo: 'Esfera Armilar', elemento: 'Símbolo Heráldico na Bandeira Nacional', detalhe: 'Instrumento astronómico de navegação manuelino dourado que representa o papel pioneiro de Portugal nos Descobrimentos marítimos' },
  { simbolo: 'Cinco Quinas Azuis', elemento: 'Escudo Nacional', detalhe: 'Representam os cinco reis mouros derrotados por D. Afonso Henriques na mítica Batalha de Ourique em 1139' },
  { simbolo: 'Sete Castelos Dourados', elemento: 'Borda Vermelha do Escudo', detalhe: 'Simbolizam as praças-fortes tomadas aos mouros por D. Afonso III na conquista definitiva do Reino do Algarve' },
  { simbolo: 'Bandeira Concelhia de Lisboa', elemento: 'Heráldica Municipal', detalhe: 'Bandeira gironada de preto e branco, ostentando a barca de São Vicente guardada por dois corvos' },
  { simbolo: 'Bandeira Concelhia do Porto', elemento: 'Heráldica Municipal', detalhe: 'Bandeira esquartelada de verde e branco com as armas da Cidade Invicta protegidas por Nossa Senhora de Vandoma' },
  { simbolo: 'Galo de Barcelos', elemento: 'Símbolo da Olaria e Folclore', detalhe: 'Lenda do peregrino galego a caminho de Santiago de Compostela salvo pelo canto miraculoso de um galo assado' },
];

// ============================================================================
// BASE ORIGINAL FACTUAL
// ============================================================================
const {
  REIS_PORTUGAL,
  BATALHAS_HISTORICAS,
  MONUMENTOS_PORTUGAL,
  GEOGRAFIA_PORTUGAL,
  CLUBES_FUTEBOL,
  GASTRONOMIA_FACTOS,
  VILA_REAL_FACTOS,
  MODO_MALUCO_TEMAS
} = require('./generators_pool_data_base');

function generateQuestionsForSubcategory(catSlug, subId, requestedCount, offset = 0) {
  const generated = [];

  // A. DESAFIO CIDADE — VILA REAL
  if (catSlug === 'desafio-cidade' || subId.includes('vila-real')) {
    for (let i = 0; i < requestedCount; i++) {
      const idx = (offset + i) % VILA_REAL_FACTOS.length;
      const f = VILA_REAL_FACTOS[idx];
      const round = Math.floor((offset + i) / VILA_REAL_FACTOS.length);
      
      const templates = [
        {
          q: `Em Vila Real, relativamente ao tema «${f.tema}», qual é a característica mais marcante?`,
          opts: [f.facto, 'Monumento construído no Algarve durante o século XX', 'Polo desportivo de desportos de inverno na Madeira', 'Catedral gótica junto à foz do Rio Sado'],
          correct: 0,
          diff: 2
        },
        {
          q: `Qual destas referências culturais e históricas pertence genuinamente ao património de Vila Real?`,
          opts: ['Mosteiro dos Jerónimos', f.tema, 'Castelo de Almourol', 'Palácio da Pena em Sintra'],
          correct: 1,
          diff: 1
        },
        {
          q: `No património e tradições de Vila Real, a que elemento corresponde o facto: «${f.facto}»?`,
          opts: ['Sé de Braga', 'Castelo de Guimarães', f.tema, 'Torre dos Clérigos'],
          correct: 2,
          diff: 3
        },
        {
          q: `Identifique a afirmação historicamente correta sobre ${f.tema} no concelho de Vila Real:`,
          opts: ['Foi fundado em 1999 em Lisboa', 'Localiza-se junto ao Cabo da Roca', 'Situa-se no Alentejo Litoral', f.facto],
          correct: 3,
          diff: 2
        }
      ];

      const t = templates[round % templates.length];
      generated.push({
        question: t.q,
        options: t.opts,
        correctAnswer: t.correct,
        difficulty: t.diff,
        explanation: `No concelho de Vila Real, ${f.tema} destaca-se porque: ${f.facto}.`,
        fonte: 'Arquivo Municipal de Vila Real e Turismo do Porto e Norte'
      });
    }
    return generated;
  }

  // B. MODO MALUCO
  if (catSlug === 'modo-maluco' || subId.includes('maluco')) {
    for (let i = 0; i < requestedCount; i++) {
      const mm = MODO_MALUCO_TEMAS[(offset + i) % MODO_MALUCO_TEMAS.length];
      const variant = Math.floor((offset + i) / MODO_MALUCO_TEMAS.length);
      
      let qText = mm.q;
      if (variant > 0) {
        qText = `Desafio Maluco #${variant + 1}: ${mm.q}`;
      }

      generated.push({
        question: qText,
        options: mm.opts,
        correctAnswer: mm.correct,
        difficulty: (offset + i) % 2 === 0 ? 1 : 4,
        explanation: mm.exp,
        fonte: 'Arquivo do Humor e Insólito do Acorda Portugal'
      });
    }
    return generated;
  }

  // C. POLÍTICA E PORTUGAL POLÍTICO
  if (catSlug === 'portugal-politico' || subId.includes('politico') || subId.includes('partidos') || subId.includes('governo') || subId.includes('presidente') || subId.includes('eleicoes')) {
    for (let i = 0; i < requestedCount; i++) {
      const p = POLITICA_FACTOS[(offset + i) % POLITICA_FACTOS.length];
      const round = Math.floor((offset + i) / POLITICA_FACTOS.length);
      const templates = [
        {
          q: `Na vida política e institucional portuguesa, qual foi o papel histórico de ${p.figura}?`,
          opts: [p.detalhe, 'Ministro da Marinha no reinado de D. Dinis', 'Comandante da esquadra naval na Batalha de Aljubarrota', 'Governador do Banco de Portugal no século XVIII'],
          correct: 0,
          diff: 2
        },
        {
          q: `A que figura da história política e democrática de Portugal corresponde o facto: «${p.detalhe}»?`,
          opts: ['Sidónio Pais', p.figura, 'Afonso Costa', 'Bernardino Machado'],
          correct: 1,
          diff: 2
        },
        {
          q: `No sistema político português, relativamente a ${p.tema}, qual é a designação atribuída a ${p.figura}?`,
          opts: ['Procurador-Geral da Coroa', 'Marechal do Exército Real', p.cargo, 'Juiz Conselheiro de Leão'],
          correct: 2,
          diff: 1
        }
      ];
      const t = templates[round % templates.length];
      generated.push({
        question: t.q,
        options: t.opts,
        correctAnswer: t.correct,
        difficulty: t.diff,
        explanation: `${p.figura} (${p.cargo}): ${p.detalhe}.`,
        fonte: 'Assembleia da República e Presidência da República'
      });
    }
    return generated;
  }

  // D. EMPRESAS PORTUGUESAS E ATUALIDADE ECONÓMICA
  if (catSlug === 'empresas-portuguesas' || catSlug === 'atualidade' || subId.includes('empresa') || subId.includes('economia') || subId.includes('marcas')) {
    for (let i = 0; i < requestedCount; i++) {
      const e = EMPRESAS_FACTOS[(offset + i) % EMPRESAS_FACTOS.length];
      const round = Math.floor((offset + i) / EMPRESAS_FACTOS.length);
      const templates = [
        {
          q: `No panorama empresarial e económico português, em que setor se destaca a empresa ${e.empresa}?`,
          opts: [e.setor, 'Construção naval de submarinos nucleares', 'Exploração de minas de ouro na Antártida', 'Fabrico exclusivo de naves espaciais'],
          correct: 0,
          diff: 1
        },
        {
          q: `Qual é a grande empresa portuguesa à qual está associado o seguinte perfil: «${e.detalhe}»?`,
          opts: ['Petrobras', e.empresa, 'Iberdrola', 'Telefónica de Espanha'],
          correct: 1,
          diff: 2
        },
        {
          q: `Identifique a afirmação verdadeira sobre a empresa ${e.empresa}:`,
          opts: ['Foi fundada na Alemanha em 2020', 'É uma empresa estatal norte-americana', e.detalhe, 'Dedica-se exclusivamente à agricultura de bananas'],
          correct: 2,
          diff: 2
        }
      ];
      const t = templates[round % templates.length];
      generated.push({
        question: t.q,
        options: t.opts,
        correctAnswer: t.correct,
        difficulty: t.diff,
        explanation: `A empresa ${e.empresa} opera no setor de ${e.setor}: ${e.detalhe}.`,
        fonte: 'Associação Empresarial de Portugal e Euronext Lisbon'
      });
    }
    return generated;
  }

  // E. CIÊNCIA E TECNOLOGIA
  if (catSlug === 'ciencia-tecnologia' || subId.includes('ciencia') || subId.includes('tecnologia') || subId.includes('fisica') || subId.includes('biologia')) {
    for (let i = 0; i < requestedCount; i++) {
      const c = CIENCIA_FACTOS[(offset + i) % CIENCIA_FACTOS.length];
      generated.push({
        question: `Na história da ciência e investigação portuguesa, qual foi o contributo marcante de ${c.cientista}?`,
        options: [c.detalhe, 'Descobriu a teoria da relatividade geral em 1805', 'Inventou a máquina a vapor durante o reinado de D. Afonso IV', 'Criou o primeiro satélite artificial colocado em órbita'],
        correctAnswer: 0,
        difficulty: 3,
        explanation: `No domínio de ${c.campo}, ${c.cientista} notabilizou-se porque: ${c.detalhe}.`,
        fonte: 'Academia das Ciências de Lisboa'
      });
    }
    return generated;
  }

  // F. MÚSICA
  if (catSlug === 'musica' || subId.includes('musica') || subId.includes('fado') || subId.includes('cancoes') || subId.includes('artistas')) {
    for (let i = 0; i < requestedCount; i++) {
      const m = MUSICA_FACTOS[(offset + i) % MUSICA_FACTOS.length];
      generated.push({
        question: `No universo musical português, a que artista ou banda está associado o facto: «${m.detalhe}»?`,
        options: [m.artista, 'The Beatles', 'Paco de Lucía', 'Edith Piaf'],
        correctAnswer: 0,
        difficulty: 2,
        explanation: `${m.artista} (${m.genero}): ${m.detalhe}.`,
        fonte: 'Museu do Fado e Sociedade Portuguesa de Autores'
      });
    }
    return generated;
  }

  // G. CINEMA E TELEVISÃO
  if (catSlug === 'cinema-tv' || subId.includes('cinema') || subId.includes('filmes') || subId.includes('televisao') || subId.includes('series')) {
    for (let i = 0; i < requestedCount; i++) {
      const c = CINEMA_TV_FACTOS[(offset + i) % CINEMA_TV_FACTOS.length];
      generated.push({
        question: `Na história do cinema e televisão em Portugal, como se descreve «${c.obra}»?`,
        options: [c.detalhe, 'Um festival de música eletrónica na Serra da Estrela', 'Um canal de rádio fundado em 1910 no Funchal', 'Um teatro romano construído em Évora'],
        correctAnswer: 0,
        difficulty: 2,
        explanation: `«${c.obra}» (${c.tipo}): ${c.detalhe}.`,
        fonte: 'Cinemateca Portuguesa e Arquivo RTP'
      });
    }
    return generated;
  }

  // H. DESPORTO
  if (catSlug === 'desporto' || subId.includes('desporto') || subId.includes('atletismo') || subId.includes('olimpicos') || subId.includes('surf')) {
    for (let i = 0; i < requestedCount; i++) {
      const d = DESPORTO_FACTOS[(offset + i) % DESPORTO_FACTOS.length];
      generated.push({
        question: `No desporto português de alta competição, que feito heroico alcançou ${d.atleta}?`,
        options: [d.feito, 'Venceu o Torneio de Wimbledon no ténis em 1950', 'Campeão mundial de hóquei no gelo na Finlândia', 'Primeiro astronauta português a pisar a Lua'],
        correctAnswer: 0,
        difficulty: 2,
        explanation: `${d.atleta} (${d.modalidade}): ${d.feito}.`,
        fonte: 'Comité Olímpico de Portugal (COP)'
      });
    }
    return generated;
  }

  // I. DESAFIO VISUAL & SÍMBOLOS
  if (catSlug === 'desafio-visual' || subId.includes('visual') || subId.includes('simbolos') || subId.includes('bandeiras') || subId.includes('bracoes')) {
    for (let i = 0; i < requestedCount; i++) {
      const s = SIMBOLOS_FACTOS[(offset + i) % SIMBOLOS_FACTOS.length];
      generated.push({
        question: `Na heráldica e símbolos visuais de Portugal, qual é o significado de «${s.simbolo}»?`,
        options: [s.detalhe, 'Recorda o tratado de paz assinado com o Império Otomano', 'Simboliza as cinco ilhas desertas do Oceano Pacífico', 'Homenageia a fundação da primeira fábrica de vidro'],
        correctAnswer: 0,
        difficulty: 2,
        explanation: `«${s.simbolo}» (${s.elemento}): ${s.detalhe}.`,
        fonte: 'Comissão de Heráldica e História de Portugal'
      });
    }
    return generated;
  }

  // J. HISTÓRIA
  if (catSlug === 'historia' || subId.includes('historia') || subId.includes('reis') || subId.includes('batalhas')) {
    for (let i = 0; i < requestedCount; i++) {
      if ((offset + i) % 2 === 0) {
        const r = REIS_PORTUGAL[(offset + i) % REIS_PORTUGAL.length];
        const round = Math.floor((offset + i) / REIS_PORTUGAL.length);
        
        const qTemplates = [
          {
            q: `Na história dos monarcas portugueses, qual foi o cognome atribuído a ${r.nome}?`,
            opts: [r.cognome, 'O Africano', 'O Bravo', 'O Lavrador'].filter((v, idx, arr) => arr.indexOf(v) === idx),
            correct: 0,
            exp: `${r.nome} ficou historicamente conhecido pelo cognome de «${r.cognome}». ${r.feito}.`
          },
          {
            q: `A que dinastia real de Portugal pertenceu o monarca ${r.nome}?`,
            opts: ['Dinastia Filipina (3ª)', r.dinastia, 'Dinastia de Borgonha Francesa', 'Dinastia Carolíngia'],
            correct: 1,
            exp: `${r.nome} governou Portugal durante a ${r.dinastia}.`
          },
          {
            q: `Qual destes reis de Portugal realizou o seguinte feito: «${r.feito}»?`,
            opts: ['D. Sebastião', 'D. Dinis', r.nome, 'D. Afonso Henriques'].filter((v, idx, arr) => arr.indexOf(v) === idx),
            correct: 2,
            exp: `Foi ${r.nome} quem se destacou pelo marco: ${r.feito}.`
          }
        ];

        while (qTemplates[round % qTemplates.length].opts.length < 4) {
          qTemplates[round % qTemplates.length].opts.push(`Opção Extra ${qTemplates[round % qTemplates.length].opts.length + 1}`);
        }

        const chosen = qTemplates[round % qTemplates.length];
        generated.push({
          question: chosen.q,
          options: chosen.opts.slice(0, 4),
          correctAnswer: chosen.correct,
          difficulty: ((offset + i) % 3) + 1,
          explanation: chosen.exp,
          fonte: 'História de Portugal — Dicionário de Monarcas'
        });
      } else {
        const b = BATALHAS_HISTORICAS[(offset + i) % BATALHAS_HISTORICAS.length];
        generated.push({
          question: `Em que ano ocorreu a histórica ${b.nome}, decisiva para a independência e soberania de Portugal?`,
          options: [String(b.ano), String(b.ano - 15), String(b.ano + 22), String(b.ano + 48)],
          correctAnswer: 0,
          difficulty: 3,
          explanation: `A ${b.nome} travou-se em ${b.ano} em ${b.local}. ${b.contexto}.`,
          fonte: 'Arquivo Histórico Militar de Portugal'
        });
      }
    }
    return generated;
  }

  // K. GEOGRAFIA
  if (catSlug === 'geografia' || subId.includes('geografia') || subId.includes('rios') || subId.includes('montanhas')) {
    for (let i = 0; i < requestedCount; i++) {
      const g = GEOGRAFIA_PORTUGAL[(offset + i) % GEOGRAFIA_PORTUGAL.length];
      generated.push({
        question: `No relevo e geografia física de Portugal, qual é a classificação correta de «${g.elemento}»?`,
        options: [g.detalhe, 'Pico vulcânico no centro da Serra do Caldeirão', 'Lago artificial no estuário do Rio Minho', 'Região desértica do Alentejo Litoral'],
        correctAnswer: 0,
        difficulty: 2,
        explanation: `${g.elemento} classifica-se como ${g.tipo}: ${g.detalhe}.`,
        fonte: 'Atlas Geográfico de Portugal'
      });
    }
    return generated;
  }

  // L. FUTEBOL PORTUGUÊS
  if (catSlug === 'futebol-portugues' || subId.includes('futebol') || subId.includes('clubes')) {
    for (let i = 0; i < requestedCount; i++) {
      const c = CLUBES_FUTEBOL[(offset + i) % CLUBES_FUTEBOL.length];
      generated.push({
        question: `No futebol português, qual é o estádio oficial e casa desportiva do ${c.clube}?`,
        options: [c.estadio, 'Estádio do Jamor', 'Estádio Municipal de Leiria', 'Estádio do Bonfim'],
        correctAnswer: 0,
        difficulty: 1,
        explanation: `O recinto e estádio principal do ${c.clube} é o ${c.estadio}. ${c.titulos}.`,
        fonte: 'Liga Portugal e Federação Portuguesa de Futebol'
      });
    }
    return generated;
  }

  // M. GASTRONOMIA
  if (catSlug === 'gastronomia' || subId.includes('gastronomia') || subId.includes('pratos') || subId.includes('doces')) {
    for (let i = 0; i < requestedCount; i++) {
      const g = GASTRONOMIA_FACTOS[(offset + i) % GASTRONOMIA_FACTOS.length];
      generated.push({
        question: `Na culinária e doçaria tradicional portuguesa, de que região é originário o famoso prato «${g.prato}»?`,
        options: [g.regiao, 'Algarve Central', 'Madeira Interior', 'Ilha Graciosa'],
        correctAnswer: 0,
        difficulty: 1,
        explanation: `O prato «${g.prato}» é típico de ${g.regiao}: ${g.detalhe}.`,
        fonte: 'Carta Gastronómica de Portugal'
      });
    }
    return generated;
  }

  // N. DEFAULT / MONUMENTOS / DESAFIO NACIONAL
  for (let i = 0; i < requestedCount; i++) {
    const m = MONUMENTOS_PORTUGAL[(offset + i) % MONUMENTOS_PORTUGAL.length];
    generated.push({
      question: `No património edificado e arquitetónico português, onde se localiza o monumento «${m.nome}»?`,
      options: [m.local, 'Portimão', 'Ponta Delgada', 'Castelo Branco'],
      correctAnswer: 0,
      difficulty: 2,
      explanation: `O monumento «${m.nome}» situa-se em ${m.local}, sendo de estilo ${m.estilo} e datado do ${m.seculo}. ${m.curiosidade}.`,
      fonte: 'Direção-Geral do Património Cultural (DGPC)'
    });
  }

  return generated;
}

module.exports = {
  generateQuestionsForSubcategory
};
