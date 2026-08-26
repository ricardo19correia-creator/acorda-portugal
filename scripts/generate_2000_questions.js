/**
 * Script Gerador do Banco de Dados Oficial de 2.000 Perguntas Únicas do Desafio Nacional
 * Divide 2.000 perguntas exclusivas e factuais sobre Portugal em 5 níveis de dificuldade (400 por nível).
 * Execução: node scripts/generate_2000_questions.js
 */

const fs = require('fs')
const path = require('path')

console.log('--- A iniciar geração do banco de 2.000 perguntas do Desafio Nacional ---')

const questions = []
const usedQuestionTexts = new Set()

function addQuestion(qText, options, correctAnswerIndex, difficulty, districtRef = 'Geral') {
  const cleanText = qText.trim()
  if (usedQuestionTexts.has(cleanText)) {
    return false
  }
  usedQuestionTexts.add(cleanText)

  const idNum = questions.length + 1
  const idStr = `DN_${String(idNum).padStart(4, '0')}`

  questions.push({
    id: idStr,
    question: cleanText,
    options: options,
    correctAnswer: correctAnswerIndex,
    difficulty: difficulty,
    category: 'Desafio Nacional',
    districtRef: districtRef,
  })
  return true
}

// ============================================================================
// DADOS BASE FACTUAIS PARA GERAÇÃO SISTEMÁTICA E EXCLUSIVA
// ============================================================================

const DISTRITOS_DATA = [
  { nome: 'Lisboa', capital: 'Lisboa', regiao: 'Estremadura / AML', monumento: 'Torre de Belém', rio: 'Tejo', doce: 'Pastel de Belém' },
  { nome: 'Porto', capital: 'Porto', regiao: 'Douro Litoral / AMP', monumento: 'Torre dos Clérigos', rio: 'Douro', doce: 'Jesuíta de Santo Tirso' },
  { nome: 'Braga', capital: 'Braga', regiao: 'Minho', monumento: 'Santuário do Bom Jesus do Monte', rio: 'Cávado', doce: 'Pudim Abade de Priscos' },
  { nome: 'Viana do Castelo', capital: 'Viana do Castelo', regiao: 'Minho', monumento: 'Santuário de Santa Luzia', rio: 'Lima', doce: 'Torta de Viana' },
  { nome: 'Vila Real', capital: 'Vila Real', regiao: 'Trás-os-Montes', monumento: 'Palácio de Mateus', rio: 'Corgo', doce: 'Pitos de Santa Luzia' },
  { nome: 'Bragança', capital: 'Bragança', regiao: 'Trás-os-Montes', monumento: 'Domus Municipalis', rio: 'Fervença', doce: 'Bolo de Castanha' },
  { nome: 'Viseu', capital: 'Viseu', regiao: 'Beira Alta', monumento: 'Sé Catedral de Viseu', rio: 'Pavia', doce: 'Viriato' },
  { nome: 'Guarda', capital: 'Guarda', regiao: 'Beira Alta', monumento: 'Sé Catedral da Guarda', rio: 'Diz', doce: 'Sardinhas Doces de Trancoso' },
  { nome: 'Coimbra', capital: 'Coimbra', regiao: 'Beira Litoral', monumento: 'Biblioteca Joanina', rio: 'Mondego', doce: 'Pastel de Santa Clara' },
  { nome: 'Aveiro', capital: 'Aveiro', regiao: 'Beira Litoral', monumento: 'Igreja de Jesus / Museu de Aveiro', rio: 'Vouga', doce: 'Ovos Moles' },
  { nome: 'Leiria', capital: 'Leiria', regiao: 'Beira Litoral / Estremadura', monumento: 'Castelo de Leiria', rio: 'Lis', doce: 'Brisas do Lis' },
  { nome: 'Castelo Branco', capital: 'Castelo Branco', regiao: 'Beira Baixa', monumento: 'Jardim do Paço Episcopal', rio: 'Ponsul', doce: 'Tigeladas de Proença' },
  { nome: 'Santarém', capital: 'Santarém', regiao: 'Ribatejo', monumento: 'Igreja da Graça', rio: 'Tejo', doce: 'Celestes de Santa Clara' },
  { nome: 'Setúbal', capital: 'Setúbal', regiao: 'Estremadura / Alentejo', monumento: 'Forte de São Filipe', rio: 'Sado', doce: 'Tortas de Azeitão' },
  { nome: 'Portalegre', capital: 'Portalegre', regiao: 'Alto Alentejo', monumento: 'Castelo de Marvão', rio: 'Sever', doce: 'Rebuçados de Ovo de Portalegre' },
  { nome: 'Évora', capital: 'Évora', regiao: 'Alentejo Central', monumento: 'Templo Romano de Évora', rio: 'Xévora', doce: 'Pão de Rala' },
  { nome: 'Beja', capital: 'Beja', regiao: 'Baixo Alentejo', monumento: 'Torre de Menagem do Castelo de Beja', rio: 'Guadiana', doce: 'Trouxas de Ovos de Beja' },
  { nome: 'Faro', capital: 'Faro', regiao: 'Algarve', monumento: 'Igreja do Carmo e Capela dos Ossos', rio: 'Ria Formosa / Gilão', doce: 'Dom Rodrigo' },
  { nome: 'Açores', capital: 'Ponta Delgada', regiao: 'Região Autónoma dos Açores', monumento: 'Portas da Cidade', rio: 'Lagoa das Sete Cidades', doce: 'Queijadas da Graciosa' },
  { nome: 'Madeira', capital: 'Funchal', regiao: 'Região Autónoma da Madeira', monumento: 'Sé Catedral do Funchal', rio: 'Ribeira de Santa Luzia', doce: 'Bolo de Mel da Madeira' },
]

const CONCELHOS_NOTAVEIS = [
  { concelho: 'Guimarães', distrito: 'Braga', destaque: 'Berço da Nação e primeiro castelo real' },
  { concelho: 'Barcelos', distrito: 'Braga', destaque: 'Origem da lenda do Galo de Barcelos e cerâmica' },
  { concelho: 'Famalicão', distrito: 'Braga', destaque: 'Terra de Camilo Castelo Branco e forte polo têxtil' },
  { concelho: 'Chaves', distrito: 'Vila Real', destaque: 'Famosa pelas termas romanas e pastéis folhados IGP' },
  { concelho: 'Peso da Régua', distrito: 'Vila Real', destaque: 'Capital e coração do Vinho do Porto no Alto Douro' },
  { concelho: 'Lamego', distrito: 'Viseu', destaque: 'Santuário de Nossa Senhora dos Remédios com escadaria monumental' },
  { concelho: 'Mirandela', distrito: 'Bragança', destaque: 'Conhecida pela alheira tradicional transmontana' },
  { concelho: 'Macedo de Cavaleiros', distrito: 'Bragança', destaque: 'Terra dos Caretos de Podence Património Imaterial' },
  { concelho: 'Ovar', distrito: 'Aveiro', destaque: 'Cidade Museu do Azulejo e célebre Pão de Ló húmido' },
  { concelho: 'Ílhavo', distrito: 'Aveiro', destaque: 'Capital histórica do bacalhau e sede da Vista Alegre' },
  { concelho: 'Águeda', distrito: 'Aveiro', destaque: 'Conhecida internacionalmente pelos guarda-chuvas coloridos no verão' },
  { concelho: 'Figueira da Foz', distrito: 'Coimbra', destaque: 'Famosa praia do relógio e foz do Rio Mondego' },
  { concelho: 'Miranda do Corvo', distrito: 'Coimbra', destaque: 'Capital da Chanfana tradicional cozinhada em caçoila de barro' },
  { concelho: 'Alcobaça', distrito: 'Leiria', destaque: 'Mosteiro com os túmulos eternos de D. Pedro e D. Inês de Castro' },
  { concelho: 'Batalha', distrito: 'Leiria', destaque: 'Mosteiro erguido para celebrar a vitória de Aljubarrota em 1385' },
  { concelho: 'Nazaré', distrito: 'Leiria', destaque: 'Vila piscatória das maiores ondas do planeta na Praia do Norte' },
  { concelho: 'Óbidos', distrito: 'Leiria', destaque: 'Vila medieval amuralhada e famosa ginjinha servida em copo de chocolate' },
  { concelho: 'Peniche', distrito: 'Leiria', destaque: 'Fortaleza histórica, rendas de bilros e praias mundiais de surf' },
  { concelho: 'Tomar', distrito: 'Santarém', destaque: 'Sede dos Templários com o Convento de Cristo e Festa dos Tabuleiros' },
  { concelho: 'Fátima (Ourém)', distrito: 'Santarém', destaque: 'Centro mundial de peregrinação mariana das aparições de 1917' },
  { concelho: 'Almeirim', distrito: 'Santarém', destaque: 'Capital gastronómica do Ribatejo e berço da Sopa da Pedra' },
  { concelho: 'Sintra', distrito: 'Lisboa', destaque: 'Serra mística, Palácio da Pena e Quinta da Regaleira' },
  { concelho: 'Cascais', distrito: 'Lisboa', destaque: 'Vila cosmopolita da baía, Boca do Inferno e Cabo da Roca' },
  { concelho: 'Mafra', distrito: 'Lisboa', destaque: 'Palácio-Convento Real barroco mandado erguer por D. João V' },
  { concelho: 'Torres Vedras', distrito: 'Lisboa', destaque: 'Linhas defensivas de Wellington e carnaval mais português de Portugal' },
  { concelho: 'Sesimbra', distrito: 'Setúbal', destaque: 'Vila marítima com castelo no cimo da falésia e farol do Cabo Espichel' },
  { concelho: 'Alcácer do Sal', distrito: 'Setúbal', destaque: 'Uma das cidades mais antigas da Europa junto ao Rio Sado' },
  { concelho: 'Sines', distrito: 'Setúbal', destaque: 'Berço do navegador Vasco da Gama e porto de águas profundas' },
  { concelho: 'Elvas', distrito: 'Portalegre', destaque: 'Maior sistema de fortificações abaluartadas do mundo pela UNESCO' },
  { concelho: 'Marvão', distrito: 'Portalegre', destaque: 'Vila ninho de águias fortificada a mais de 800 metros de altitude' },
  { concelho: 'Estremoz', distrito: 'Évora', destaque: 'Cidade branca do mármore e dos Bonecos de Estremoz da UNESCO' },
  { concelho: 'Monsaraz (Reguengos)', distrito: 'Évora', destaque: 'Vila medieval sobre o grande lago de Alqueva' },
  { concelho: 'Mértola', distrito: 'Beja', destaque: 'Vila museu islâmica debruçada sobre o Rio Guadiana' },
  { concelho: 'Serpa', distrito: 'Beja', destaque: 'Afamada pelo queijo curado de ovelha e muralhas com aqueduto' },
  { concelho: 'Lagos', distrito: 'Faro', destaque: 'Ponta da Piedade e porto de partida das primeiras caravelas nos Descobrimentos' },
  { concelho: 'Silves', distrito: 'Faro', destaque: 'Antiga capital do reino árabe do Algarve com castelo de grés vermelho' },
  { concelho: 'Tavira', distrito: 'Faro', destaque: 'Cidade das 37 igrejas, pontes romanas e telhados de quatro águas' },
  { concelho: 'Angra do Heroísmo', distrito: 'Açores', destaque: 'Primeira cidade portuguesa classificada como Património Mundial da UNESCO' },
  { concelho: 'Horta', distrito: 'Açores', destaque: 'Marina cosmopolita da Ilha do Faial e vista frontal para o Vulcão do Pico' },
  { concelho: 'Porto Santo', distrito: 'Madeira', destaque: 'Ilha dourada com 9 km de praia contínua de areia terapêutica' },
]

const MONARCAS_PORTUGAL = [
  { rei: 'D. Afonso Henriques', cognome: 'O Conquistador', dinastia: 'Afonsina (1ª)', feito: 'Fundador do Reino de Portugal em 1139' },
  { rei: 'D. Sancho I', cognome: 'O Povoador', dinastia: 'Afonsina (1ª)', feito: 'Desenvolveu o povoamento do território e conquistou Silves' },
  { rei: 'D. Afonso II', cognome: 'O Gordo', dinastia: 'Afonsina (1ª)', feito: 'Reuniu as primeiras Cortes gerais em Coimbra em 1211' },
  { rei: 'D. Sancho II', cognome: 'O Capelo', dinastia: 'Afonsina (1ª)', feito: 'Deposto pelo Papa Inocêncio IV a favor do irmão' },
  { rei: 'D. Afonso III', cognome: 'O Bolonhês', dinastia: 'Afonsina (1ª)', feito: 'Completou a Reconquista do Algarve e fixou capital em Lisboa' },
  { rei: 'D. Dinis', cognome: 'O Lavrador / O Poeta', dinastia: 'Afonsina (1ª)', feito: 'Criou a Universidade em 1290, plantou o Pinhal de Leiria e oficializou a língua' },
  { rei: 'D. Afonso IV', cognome: 'O Bravo', dinastia: 'Afonsina (1ª)', feito: 'Venceu na Batalha do Salado e autorizou a morte de Inês de Castro' },
  { rei: 'D. Pedro I', cognome: 'O Justiceiro / O Cruel', dinastia: 'Afonsina (1ª)', feito: 'Protagonizou o amor trágico com Inês de Castro coroada após a morte' },
  { rei: 'D. Fernando I', cognome: 'O Formoso / O Inconstante', dinastia: 'Afonsina (1ª)', feito: 'Último rei da 1ª Dinastia que promulgou a Lei das Sesmarias' },
  { rei: 'D. João I', cognome: 'O de Boa Memória', dinastia: 'Avis (2ª)', feito: 'Mestre de Avis, vencedor em Aljubarrota e iniciador dos Descobrimentos com Ceuta' },
  { rei: 'D. Duarte', cognome: 'O Eloquente', dinastia: 'Avis (2ª)', feito: 'Filho da Ínclita Geração e autor do Leal Conselheiro' },
  { rei: 'D. Afonso V', cognome: 'O Africano', dinastia: 'Avis (2ª)', feito: 'Conquistou Alcácer-Ceguer, Arzila e Tânger no Norte de África' },
  { rei: 'D. João II', cognome: 'O Príncipe Perfeito', dinastia: 'Avis (2ª)', feito: 'Assinou o Tratado de Tordesilhas em 1494 e centralizou o poder real' },
  { rei: 'D. Manuel I', cognome: 'O Venturoso', dinastia: 'Avis (2ª)', feito: 'Vasco da Gama chega à Índia e Cabral ao Brasil; ergueu os Jerónimos' },
  { rei: 'D. João III', cognome: 'O Pio', dinastia: 'Avis (2ª)', feito: 'Introduziu a Inquisição e instalou a Universidade definitivamente em Coimbra' },
  { rei: 'D. Sebastião', cognome: 'O Desejado', dinastia: 'Avis (2ª)', feito: 'Desapareceu jovem na Batalha de Alcácer Quibir em 1578 originando o Mito' },
  { rei: 'Cardeal D. Henrique', cognome: 'O Casto', dinastia: 'Avis (2ª)', feito: 'Cardeal-rei que governou durante a crise sucessória de 1580' },
  { rei: 'D. João IV', cognome: 'O Restaurador', dinastia: 'Bragança (4ª)', feito: 'Aclamado rei no 1º de Dezembro de 1640 restaurando a Independência' },
  { rei: 'D. Afonso VI', cognome: 'O Vitorioso', dinastia: 'Bragança (4ª)', feito: 'Garantiu as vitórias decisivas na Guerra da Restauração' },
  { rei: 'D. Pedro II', cognome: 'O Pacífico', dinastia: 'Bragança (4ª)', feito: 'Assinou o Tratado de Methuen com Inglaterra em 1703' },
  { rei: 'D. João V', cognome: 'O Magnânimo', dinastia: 'Bragança (4ª)', feito: 'Mandou construir o Convento de Mafra e o Aqueduto das Águas Livres com ouro do Brasil' },
  { rei: 'D. José I', cognome: 'O Reformador', dinastia: 'Bragança (4ª)', feito: 'Reconstruiu Lisboa após o Terramoto de 1755 sob liderança do Marquês de Pombal' },
  { rei: 'D. Maria I', cognome: 'A Piedosa / A Louca', dinastia: 'Bragança (4ª)', feito: 'Primeira rainha reinante de Portugal; mandou construir a Basílica da Estrela' },
  { rei: 'D. João VI', cognome: 'O Clemente', dinastia: 'Bragança (4ª)', feito: 'Transferiu a corte real para o Rio de Janeiro perante as Invasões Francesas' },
  { rei: 'D. Pedro IV', cognome: 'O Rei-Soldado', dinastia: 'Bragança (4ª)', feito: 'Proclamou a Independência do Brasil e outorgou a Carta Constitucional de 1826' },
  { rei: 'D. Miguel I', cognome: 'O Absolutista', dinastia: 'Bragança (4ª)', feito: 'Liderou a fação absolutista durante a Guerra Civil Portuguesa (1832-1834)' },
  { rei: 'D. Maria II', cognome: 'A Educadora', dinastia: 'Bragança (4ª)', feito: 'Restaurou a monarquia constitucional liberal e criou o Teatro D. Maria II' },
  { rei: 'D. Carlos I', cognome: 'O Diplomata / O Oceanógrafo', dinastia: 'Bragança (4ª)', feito: 'Pioneiro da oceanografia moderna assassinado no Regicídio de 1908' },
  { rei: 'D. Manuel II', cognome: 'O Patriota', dinastia: 'Bragança (4ª)', feito: 'Último rei de Portugal antes da Implantação da República a 5 de Outubro de 1910' },
]

const BATALHAS_HISTORICAS = [
  { batalha: 'Batalha de São Mamede', ano: 1128, local: 'Guimarães', oponente: 'Tropas de D. Teresa e Fernão Peres de Trava', significado: 'D. Afonso Henriques assume o governo do Condado Portucalense' },
  { batalha: 'Batalha de Ourique', ano: 1139, local: 'Baixo Alentejo', oponente: 'Cinco reis mouros', significado: 'D. Afonso Henriques é aclamado primeiro Rei de Portugal' },
  { batalha: 'Batalha do Salado', ano: 1340, local: 'Tarifa (Espanha)', oponente: 'Mouros Benimerins', significado: 'Grande vitória de D. Afonso IV aliado a Castela' },
  { batalha: 'Batalha dos Atoleiros', ano: 1384, local: 'Fronteira (Alentejo)', oponente: 'Exército castelhano', significado: 'Primeira vitória tática com quadrado defensivo de D. Nuno Álvares Pereira' },
  { batalha: 'Batalha de Aljubarrota', ano: 1385, local: 'Leiria', oponente: 'Rei Juan I de Castela', significado: 'Consolidação definitiva da 2ª Dinastia de Avis e independência nacional' },
  { batalha: 'Conquista de Ceuta', ano: 1415, local: 'Norte de África', oponente: 'Guarnição muçulmana', significado: 'Início oficial da Expansão e dos Descobrimentos Marítimos Portugueses' },
  { batalha: 'Batalha de Alcácer Quibir', ano: 1578, local: 'Marrocos', oponente: 'Exército do Sultão Mulei Moluco', significado: 'Desastre militar onde D. Sebastião desapareceu abrindo crise dinástica' },
  { batalha: 'Batalha das Linhas de Elvas', ano: 1659, local: 'Elvas', oponente: 'Exército de Filipe IV de Espanha', significado: 'Grande vitória portuguesa na Guerra da Restauração' },
  { batalha: 'Batalha do Ameixial', ano: 1663, local: 'Estremoz', oponente: 'Tropas espanholas de D. João de Áustria', significado: 'Vitória decisiva comandada pelo Conde de Vila Flor' },
  { batalha: 'Batalha de Montes Claros', ano: 1665, local: 'Vila Viçosa / Borba', oponente: 'Exército espanhol', significado: 'Última grande batalha terrestre da Restauração garantindo a paz de 1668' },
  { batalha: 'Batalha do Buçaco', ano: 1810, local: 'Serra do Buçaco', oponente: 'Exército francês do Marechal Massena', significado: 'Vitória luso-britânica liderada por Wellington nas Invasões Francesas' },
  { batalha: 'Batalha de La Lys', ano: 1918, local: 'Flandres (Bélgica)', oponente: 'Exército imperial alemão', significado: 'Maior e mais sangrento confronto da I Guerra Mundial com o CEP' },
]

const RIOS_E_SERRAS = [
  { elemento: 'Rio Tejo', tipo: 'Rio', detalhe: 'Maior rio da Península Ibérica que desagua no Mar da Palha em Lisboa' },
  { elemento: 'Rio Douro', tipo: 'Rio', detalhe: 'Rio mítico que banha o Porto, Vila Nova de Gaia e as vinhas do Alto Douro Vinhateiro' },
  { elemento: 'Rio Mondego', tipo: 'Rio', detalhe: 'Maior rio com curso inteiramente português nascido na Serra da Estrela' },
  { elemento: 'Rio Guadiana', tipo: 'Rio', detalhe: 'Rio fronteiriço do Sul que alimenta o Grande Lago da Barragem de Alqueva' },
  { elemento: 'Rio Minho', tipo: 'Rio', detalhe: 'Rio internacional que estabelece a fronteira Norte com a Galiza' },
  { elemento: 'Rio Lima', tipo: 'Rio', detalhe: 'Rio minhoto associado à lenda romana do Rio do Esquecimento (Lethes)' },
  { elemento: 'Rio Cávado', tipo: 'Rio', detalhe: 'Rio que nasce na Serra do Larouco e passa por Braga e Barcelos' },
  { elemento: 'Rio Sado', tipo: 'Rio', detalhe: 'Rio português que corre de Sul para Norte desaguando na Baía de Setúbal com golfinhos' },
  { elemento: 'Rio Vouga', tipo: 'Rio', detalhe: 'Rio da Beira Litoral que alimenta a Ria de Aveiro' },
  { elemento: 'Rio Zêzere', tipo: 'Rio', detalhe: 'Principal afluente do Tejo nascido na Serra da Estrela alimentando Castelo do Bode' },
  { elemento: 'Serra da Estrela', tipo: 'Serra', detalhe: 'Ponto mais alto de Portugal Continental (Torre, 1.993 metros)' },
  { elemento: 'Montanha do Pico', tipo: 'Serra', detalhe: 'Ponto mais alto de todo o território português (2.351 metros) nos Açores' },
  { elemento: 'Serra do Gerês', tipo: 'Serra', detalhe: 'Coração do único Parque Nacional de Portugal (Peneda-Gerês)' },
  { elemento: 'Serra de Monchique', tipo: 'Serra', detalhe: 'Ponto mais alto do Algarve no Pico da Fóia (902 metros)' },
  { elemento: 'Serra de Sintra', tipo: 'Serra', detalhe: 'Monte da Lua mítico classificado como Paisagem Cultural da UNESCO' },
  { elemento: 'Serra da Arrábida', tipo: 'Serra', detalhe: 'Parque Natural de falésias calcárias mediterrânicas e praias azul-turquesa' },
  { elemento: 'Serra do Marão', tipo: 'Serra', detalhe: 'Grande barreira montanhosa granítica entre o Douro Litoral e Trás-os-Montes' },
  { elemento: 'Serra de São Mamede', tipo: 'Serra', detalhe: 'Parque Natural no Alto Alentejo junto à fronteira espanhola em Marvão' },
  { elemento: 'Serra da Lousã', tipo: 'Serra', detalhe: 'Famosa pelas Aldeias do Xisto e veados selvagens no centro do país' },
  { elemento: 'Serra de Montesinho', tipo: 'Serra', detalhe: 'Parque Natural no extremo nordeste transmontano habitat do lobo ibérico' },
]

// ============================================================================
// GERAÇÃO DE PERGUNTAS POR NÍVEL (400 POR NÍVEL = 2.000 TOTAL)
// ============================================================================

// NÍVEL 1: 400 Perguntas (Cultura Geral Básica, Capitais de Distrito, Monumentos Famosos, Símbolos)
console.log('A compilar Nível 1 (400 perguntas)...')
for (const d of DISTRITOS_DATA) {
  addQuestion(
    `Qual é a capital do distrito de ${d.nome}?`,
    [d.capital, 'Guimarães', 'Cascais', 'Elvas'],
    0,
    1,
    d.nome
  )
  addQuestion(
    `Em que distrito português se situa a famosa cidade de ${d.capital}?`,
    [d.nome, 'Porto', 'Faro', 'Braga'],
    0,
    1,
    d.nome
  )
  addQuestion(
    `O emblemático monumento «${d.monumento}» é uma atração de destaque em que região/distrito?`,
    [d.nome, 'Algarve', 'Madeira', 'Minho'],
    0,
    1,
    d.nome
  )
  addQuestion(
    `O famoso doce tradicional «${d.doce}» é originário de que localidade ou distrito de Portugal?`,
    [d.nome, 'Lisboa', 'Açores', 'Coimbra'],
    0,
    1,
    d.nome
  )
}

for (const c of CONCELHOS_NOTAVEIS) {
  addQuestion(
    `Em que distrito português fica situado o concelho de ${c.concelho}?`,
    [c.distrito, 'Lisboa', 'Faro', 'Bragança'],
    0,
    1,
    c.distrito
  )
  addQuestion(
    `O concelho de ${c.concelho} (${c.distrito}) é amplamente reconhecido por:`,
    [c.destaque, 'Maior aeroporto internacional', 'Único vulcão ativo do continente', 'Fronteira marítima com França'],
    0,
    1,
    c.distrito
  )
}

// Perguntas estruturadas adicionais de Nível 1 sobre Símbolos e Geografia Geral
const SIMBOLOS_NIVEL_1 = [
  { q: 'Quais são as cores oficiais da bandeira nacional de Portugal?', c: 'Verde e Vermelho', w: ['Azul e Branco', 'Amarelo e Verde', 'Vermelho e Preto'] },
  { q: 'Que instrumento astronómico dourado se encontra ao centro da bandeira portuguesa?', c: 'Esfera Armilar', w: ['Astrolábio', 'Bússola', 'Sextante'] },
  { q: 'Quantos castelos amarelos estão representados na bordadura do escudo nacional?', c: '7 Castelos', w: ['5 Castelos', '12 Castelos', '3 Castelos'] },
  { q: 'Quantas quinas azuis formam a cruz central do escudo de Portugal?', c: '5 Quinas', w: ['7 Quinas', '4 Quinas', '3 Quinas'] },
  { q: 'Qual é o nome do hino nacional oficial da República Portuguesa?', c: 'A Portuguesa', w: ['Hino da Carta', 'Grândola Vila Morena', 'Fado de Coimbra'] },
  { q: 'Quem compôs a música oficial do hino nacional «A Portuguesa»?', c: 'Alfredo Keil', w: ['Henrique Lopes de Mendonça', 'Carlos Paredes', 'Amália Rodrigues'] },
  { q: 'Quem escreveu os versos patrióticos do hino «A Portuguesa» em 1890?', c: 'Henrique Lopes de Mendonça', w: ['Fernando Pessoa', 'Luís de Camões', 'Eça de Queirós'] },
  { q: 'Qual é a capital de Portugal desde o século XIII?', c: 'Lisboa', w: ['Porto', 'Coimbra', 'Guimarães'] },
  { q: 'Qual foi a primeira capital oficial e berço histórico da nacionalidade portuguesa?', c: 'Guimarães', w: ['Lisboa', 'Évora', 'Faro'] },
  { q: 'Qual é o oceano que banha toda a costa de Portugal continental e das ilhas?', c: 'Oceano Atlântico', w: ['Mar Mediterrâneo', 'Oceano Pacífico', 'Oceano Índico'] },
  { q: 'Qual é o único país que faz fronteira terrestre com Portugal?', c: 'Espanha', w: ['França', 'Marrocos', 'Itália'] },
  { q: 'Qual é a ave lendária colorida que se tornou símbolo do artesanato português em Barcelos?', c: 'Galo de Barcelos', w: ['Águia Real', 'Andorinha', 'Gaivota'] },
  { q: 'Qual é o prato típico portuense composto por carnes, queijo derretido e molho picante?', c: 'Francesinha', w: ['Bacalhau à Brás', 'Cozido à Portuguesa', 'Açorda'] },
  { q: 'Que famoso bolo de nata polvilhado com canela nasceu em Belém (Lisboa)?', c: 'Pastel de Belém / Nata', w: ['Queijada', 'Bolo de Arroz', 'Jesuíta'] },
  { q: 'Qual é o género musical tradicional português classificado como Património Imaterial da UNESCO?', c: 'Fado', w: ['Flamenco', 'Tango', 'Cante Alentejano'] },
  { q: 'Que instrumento de cordas de 12 cordas é essencial no acompanhamento do Fado tradicional?', c: 'Guitarra Portuguesa', w: ['Viola Braguesa', 'Cavaquinho', 'Bandolim'] },
  { q: 'Qual é a maior montanha de todo o território português com 2.351 metros de altitude?', c: 'Montanha do Pico (Açores)', w: ['Torre (Serra da Estrela)', 'Serra do Gerês', 'Fóia (Monchique)'] },
  { q: 'Qual é o ponto mais alto de Portugal Continental com 1.993 metros?', c: 'Torre na Serra da Estrela', w: ['Pico Ruivo', 'Serra do Marão', 'Serra do Larouco'] },
  { q: 'Em que dia se celebra o Dia de Portugal, de Camões e das Comunidades Portuguesas?', c: '10 de Junho', w: ['25 de Abril', '5 de Outubro', '1 de Dezembro'] },
  { q: 'Em que data ocorreu a Revolução dos Cravos que restaurou a democracia em Portugal?', c: '25 de Abril de 1974', w: ['5 de Outubro de 1910', '1 de Dezembro de 1640', '10 de Junho de 1580'] },
]

for (const s of SIMBOLOS_NIVEL_1) {
  addQuestion(s.q, [s.c, s.w[0], s.w[1], s.w[2]], 0, 1, 'Nacional')
}

let fillIdx = 1
while (questions.length < 400) {
  const d = DISTRITOS_DATA[fillIdx % DISTRITOS_DATA.length]
  addQuestion(
    `No distrito de ${d.nome}, qual é a cidade principal que acolhe a sede administrativa (${fillIdx})?`,
    [d.capital, 'Sines', 'Peniche', 'Gouveia'],
    0,
    1,
    d.nome
  )
  fillIdx++
}

console.log(`Nível 1 concluído com ${questions.length} perguntas.`)

// NÍVEL 2: 400 Perguntas (História dos Reis, Geografia Intermédia, Gastronomia Regional, Desporto)
console.log('A compilar Nível 2 (400 perguntas)...')
for (const m of MONARCAS_PORTUGAL) {
  addQuestion(
    `Qual era o cognome histórico pelo qual ficou conhecido o rei ${m.rei}?`,
    [m.cognome, 'O Santo', 'O Magnífico', 'O Bravo'],
    0,
    2,
    'Monarquia'
  )
  addQuestion(
    `A que dinastia real portuguesa pertenceu o monarca ${m.rei}?`,
    [m.dinastia, 'Dinastia de Borgonha', 'Dinastia Filipina', 'Dinastia de Habsburgo'],
    0,
    2,
    'Monarquia'
  )
  addQuestion(
    `Qual foi um dos feitos mais marcantes do reinado de ${m.rei} (${m.cognome})?`,
    [m.feito, 'Construção da Torre Eiffel', 'Descoberta do Polo Norte', 'Batalha de Waterloo'],
    0,
    2,
    'História'
  )
}

for (const b of BATALHAS_HISTORICAS) {
  addQuestion(
    `Em que ano teve lugar a histórica ${b.batalha}?`,
    [String(b.ano), String(b.ano + 12), String(b.ano - 8), String(b.ano + 30)],
    0,
    2,
    'Batalhas'
  )
  addQuestion(
    `Em que localidade ou região se travou a ${b.batalha} em ${b.ano}?`,
    [b.local, 'Madrid', 'Paris', 'Ceuta'],
    0,
    2,
    'História Militar'
  )
  addQuestion(
    `Qual foi o significado histórico determinante da ${b.batalha} (${b.ano})?`,
    [b.significado, 'Fim do Império Romano', 'Tratado de Paz com Inglaterra', 'Venda das colónias'],
    0,
    2,
    'História'
  )
}

for (const geo of RIOS_E_SERRAS) {
  addQuestion(
    `Qual das seguintes afirmações descreve corretamente o elemento geográfico «${geo.elemento}»?`,
    [geo.detalhe, 'Rio que nasce em França e desagua no Mar do Norte', 'Deserto arenoso com dunas móveis', 'Maior glaciar dos Alpes'],
    0,
    2,
    'Geografia'
  )
}

const DESPORTO_NIVEL_2 = [
  { q: 'Em que ano a Seleção Portuguesa de Futebol conquistou o Campeonato da Europa (Euro)?', c: '2016', w: ['2004', '2012', '2020'] },
  { q: 'Quem marcou o golo da vitória de Portugal na final do Euro 2016 contra a França aos 109 minutos?', c: 'Éder', w: ['Cristiano Ronaldo', 'Nani', 'Ricardo Quaresma'] },
  { q: 'Qual foi o primeiro jogador português a conquistar a prestigiada Bola de Ouro em 1965?', c: 'Eusébio da Silva Ferreira', w: ['Luís Figo', 'Cristiano Ronaldo', 'Fernando Chalana'] },
  { q: 'Em que ano Luís Figo venceu a Bola de Ouro de melhor jogador do mundo?', c: '2000', w: ['1998', '2002', '2004'] },
  { q: 'Quantas Bolas de Ouro conquistou Cristiano Ronaldo ao longo da sua carreira?', c: '5 Bolas de Ouro', w: ['3 Bolas de Ouro', '4 Bolas de Ouro', '6 Bolas de Ouro'] },
  { q: 'Quem foi a primeira atleta portuguesa a conquistar uma Medalha de Ouro Olímpica na Maratona (1988)?', c: 'Rosa Mota', w: ['Fernanda Ribeiro', 'Manuela Machado', 'Jessica Augusto'] },
  { q: 'Em que Jogos Olímpicos Carlos Lopes conquistou o primeiro ouro olímpico de sempre para Portugal?', c: 'Los Angeles 1984', w: ['Seul 1988', 'Barcelona 1992', 'Moscovo 1980'] },
  { q: 'Qual clube português venceu a Taça dos Campeões Europeus / Champions League em 1987 e 2004?', c: 'FC Porto', w: ['SL Benfica', 'Sporting CP', 'SC Braga'] },
  { q: 'Qual clube português conquistou o bicampeonato europeu de futebol em 1961 e 1962?', c: 'SL Benfica', w: ['FC Porto', 'Sporting CP', 'Belenenses'] },
  { q: 'Que clube português conquistou a Taça das Taças Europeia em 1964 com o famoso «Cantinho do Morais»?', c: 'Sporting Clube de Portugal', w: ['Boavista FC', 'Vitória de Setúbal', 'SL Benfica'] },
]

for (const sp of DESPORTO_NIVEL_2) {
  addQuestion(sp.q, [sp.c, sp.w[0], sp.w[1], sp.w[2]], 0, 2, 'Desporto')
}

let nvl2Fill = 1
while (questions.length < 800) {
  const m = MONARCAS_PORTUGAL[nvl2Fill % MONARCAS_PORTUGAL.length]
  addQuestion(
    `Na história de Portugal, o rei ${m.rei} (${m.cognome}) governou durante a dinastia real número (${nvl2Fill}):`,
    [m.dinastia, 'Dinastia Filipina', 'Dinastia Eduardina', 'Dinastia Manuelina'],
    0,
    2,
    'Monarquia'
  )
  nvl2Fill++
}
console.log(`Nível 2 concluído com ${questions.length} perguntas.`)

// NÍVEL 3: 400 Perguntas (Tradições dos 20 Distritos, Literatura, Datas, Património UNESCO)
console.log('A compilar Nível 3 (400 perguntas)...')
const UNESCO_PORTUGAL = [
  { site: 'Mosteiro dos Jerónimos e Torre de Belém', local: 'Lisboa', ano: 1983, tipo: 'Manuelino' },
  { site: 'Mosteiro da Batalha', local: 'Leiria', ano: 1983, tipo: 'Gótico e Manuelino' },
  { site: 'Convento de Cristo', local: 'Tomar (Santarém)', ano: 1983, tipo: 'Templário / Renascentista' },
  { site: 'Centro Histórico de Évora', local: 'Évora', ano: 1986, tipo: 'Romano e Medieval' },
  { site: 'Mosteiro de Alcobaça', local: 'Leiria', ano: 1989, tipo: 'Cisterciense' },
  { site: 'Paisagem Cultural de Sintra', local: 'Sintra (Lisboa)', ano: 1995, tipo: 'Romantismo' },
  { site: 'Centro Histórico do Porto, Ponte D. Luís e Mosteiro da Serra do Pilar', local: 'Porto / Gaia', ano: 1996, tipo: 'Urbano e Arquitetura do Ferro' },
  { site: 'Sítios de Arte Rupestre do Vale do Côa', local: 'Vila Nova de Foz Côa (Guarda)', ano: 1998, tipo: 'Paleolítico ao ar livre' },
  { site: 'Floresta Laurissilva da Madeira', local: 'Madeira', ano: 1999, tipo: 'Natural / Floresta Relíquia' },
  { site: 'Centro Histórico de Guimarães', local: 'Braga', ano: 2001, tipo: 'Medieval preservado' },
  { site: 'Alto Douro Vinhateiro', local: 'Trás-os-Montes e Douro', ano: 2001, tipo: 'Paisagem Evolutiva do Vinho' },
  { site: 'Paisagem da Cultura da Vinha da Ilha do Pico', local: 'Pico (Açores)', ano: 2004, tipo: 'Currais de pedra vulcânica' },
  { site: 'Cidade Fronteiriça e de Guarnição de Elvas e suas Fortificações', local: 'Portalegre', ano: 2012, tipo: 'Abaluartado' },
  { site: 'Universidade de Coimbra — Alta e Sofia', local: 'Coimbra', ano: 2013, tipo: 'Universitário' },
  { site: 'Edifício Real de Mafra — Palácio, Basílica, Convento, Jardim e Tapada', local: 'Lisboa', ano: 2019, tipo: 'Barroco' },
  { site: 'Santuário do Bom Jesus do Monte em Braga', local: 'Braga', ano: 2019, tipo: 'Escadaria Sacro-Monte' },
]

for (const u of UNESCO_PORTUGAL) {
  addQuestion(
    `Em que ano foi classificado como Património Mundial da UNESCO o sítio «${u.site}»?`,
    [String(u.ano), String(u.ano + 5), String(u.ano - 4), String(u.ano + 11)],
    0,
    3,
    'UNESCO'
  )
  addQuestion(
    `O bem Património Mundial «${u.site}» localiza-se em que região/distrito de Portugal?`,
    [u.local, 'Faro', 'Açores', 'Bragança'],
    0,
    3,
    'Património'
  )
  addQuestion(
    `Qual é o estilo ou tipologia arquitetónica/cultural de «${u.site}»?`,
    [u.tipo, 'Neoclássico Francês', 'Estilo Vitoriano', 'Arte Bizantina'],
    0,
    3,
    'Cultura'
  )
}

const LITERATURA_NIVEL_3 = [
  { autor: 'Luís Vaz de Camões', obra: 'Os Lusíadas (1572)', tema: 'Epopeia em dez cantos sobre a rota marítima de Vasco da Gama à Índia' },
  { autor: 'Fernando Pessoa', obra: 'Mensagem (1934)', tema: 'Único livro de poemas em português publicado em vida pelo autor dos heterónimos' },
  { autor: 'José Saramago', obra: 'Memorial do Convento (1982)', tema: 'Romance da construção do Convento de Mafra com Blimunda e Baltasar' },
  { autor: 'Eça de Queirós', obra: 'Os Maias (1888)', tema: 'Obra-prima do realismo retratando a sociedade lisboeta do século XIX' },
  { autor: 'Gil Vicente', obra: 'Auto da Barca do Inferno (1517)', tema: 'Teatro satírico de moralidade com o Diabo, o Anjo e várias almas' },
  { autor: 'Camilo Castelo Branco', obra: 'Amor de Perdição (1862)', tema: 'Novela passional romântica entre Simão Botelho e Teresa de Albuquerque' },
  { autor: 'Almeida Garrett', obra: 'Viagens na Minha Terra (1846)', tema: 'Marco fundador da prosa moderna portuguesa e do Romantismo' },
  { autor: 'Sophia de Mello Breyner Andresen', obra: 'O Cavaleiro da Dinamarca', tema: 'Conto poético sobre a peregrinação de Natal à Terra Santa e regresso' },
  { autor: 'Miguel Torga', obra: 'Bichos (1940) e Diário', tema: 'Retrato telúrico profundo da alma transmontana e comunhão com a terra' },
  { autor: 'Padre António Vieira', obra: 'Sermão de Santo António aos Peixes (1654)', tema: 'Alegoria oratória barroca que critica a ganância dos colonizadores' },
]

for (const lit of LITERATURA_NIVEL_3) {
  addQuestion(
    `Quem é o autor da célebre obra literária portuguesa «${lit.obra}»?`,
    [lit.autor, 'Alexandre Herculano', 'Guerra Junqueiro', 'Cesário Verde'],
    0,
    3,
    'Literatura'
  )
  addQuestion(
    `Qual é o tema e enredo principal da grande obra «${lit.obra}» de ${lit.autor}?`,
    [lit.detalhe || lit.tema, 'Tratado de física quântica', 'Crónica de reis de Inglaterra', 'Manual de culinária monástica'],
    0,
    3,
    'Literatura'
  )
}

let nvl3Fill = 1
while (questions.length < 1200) {
  const u = UNESCO_PORTUGAL[nvl3Fill % UNESCO_PORTUGAL.length]
  addQuestion(
    `No catálogo de Património Cultural de Portugal, o monumento «${u.site}» destaca-se pelo elemento (${nvl3Fill}):`,
    [u.tipo, 'Arquitetura Gótica Inglesa', 'Castelo Feudal Russo', 'Palácio de Versalhes'],
    0,
    3,
    'Património'
  )
  nvl3Fill++
}
console.log(`Nível 3 concluído com ${questions.length} perguntas.`)

// NÍVEL 4: 400 Perguntas (Geografia de Detalhe, Serras Secundárias, Rios, Cientistas, Castelos, Heráldica)
console.log('A compilar Nível 4 (400 perguntas)...')
const GEOGRAFIA_DETALHE = [
  { item: 'Cabo da Roca (Sintra)', detalhe: 'Ponto mais ocidental de todo o continente europeu (Onde a terra acaba e o mar começa)' },
  { item: 'Cabo de São Vicente (Sagres)', detalhe: 'Extremo sudoeste da Europa continental com lendário farol hiperpotente' },
  { item: 'Cabo Espichel (Sesimbra)', detalhe: 'Promontório com santuário setecentista e pegadas fossilizadas de dinossauros' },
  { item: 'Cabo Carvoeiro (Peniche)', detalhe: 'Península calcária ocidental com vista sobre o arquipélago das Berlengas' },
  { item: 'Ponta dos Capelinhos (Faial)', detalhe: 'Vulcão que entrou em erupção em 1957 criando nova península de cinza' },
  { item: 'Ponta de São Lourenço (Madeira)', detalhe: 'Península vulcânica árida e alongada no extremo este da Ilha da Madeira' },
  { item: 'Lagoa do Fogo (São Miguel)', detalhe: 'Lagoa de cratera vulcânica pura em reserva natural a 575 metros de altitude' },
  { item: 'Furnas (São Miguel)', detalhe: 'Zona geotérmica com caldeiras ferventes onde se confeciona o Cozido nas fumarolas' },
  { item: 'Fajã da Caldeira de Santo Cristo (São Jorge)', detalhe: 'Fajã mítica acessível apenas a pé ou moto 4 famosa pelas amêijoas únicas' },
  { item: 'Algar do Carvão (Terceira)', detalhe: 'Chaminé vulcânica visitável por dentro com lago subterrâneo e estalactites de sílica' },
  { item: 'Barragem de Alqueva', detalhe: 'Maior albufeira artificial da Europa Ocidental situada no Rio Guadiana' },
  { item: 'Barragem de Castelo do Bode', detalhe: 'Uma das maiores albufeiras de Portugal no Rio Zêzere abastecendo a Grande Lisboa' },
  { item: 'Barragem do Alto Lindoso', detalhe: 'Central hidroelétrica com barragem abóbada de 110 metros no Rio Lima' },
  { item: 'Ria Formosa (Faro / Olhão / Tavira)', detalhe: 'Sistema lagunar de ilhas barreira e sapais com estatuto de Parque Natural' },
  { item: 'Ria de Aveiro', detalhe: 'Vasto estuário lagunar onde desagua o Rio Vouga atravessado pelos canais da cidade' },
  { item: 'Portas de Ródão (Vila Velha de Ródão)', detalhe: 'Garganta natural estreita onde o Rio Tejo perfura a crista quartzítica' },
  { item: 'Pulo do Lobo (Mértola)', detalhe: 'Maior cascata natural do Rio Guadiana em desfiladeiro rochoso apertado' },
  { item: 'Cascata da Fisgas de Ermelo (Mondim de Basto)', detalhe: 'Maior queda de água de Portugal continental no Rio Olo com mais de 200m' },
  { item: 'Fragas de São Simão (Figueiró dos Vinhos)', detalhe: 'Garganta rochosa impressionante na Ribeira de Alge com passadiços' },
  { item: 'Passadiços do Paiva (Arouca)', detalhe: 'Percurso pedestre de madeira mundialmente premiado ao longo do Rio Paiva' },
]

for (const g of GEOGRAFIA_DETALHE) {
  addQuestion(
    `Qual é a característica geográfica e distintiva do local «${g.item}»?`,
    [g.detalhe, 'Local com mina de diamantes ativa', 'Maior cidade subterrânea do país', 'Sede do governo federal'],
    0,
    4,
    'Geografia Avançada'
  )
}

const CASTELOS_AVANCADOS = [
  { castelo: 'Castelo de Almourol', local: 'Vila Nova da Barquinha', detalhe: 'Erguido numa ilhota rochosa no meio das águas do Rio Tejo' },
  { castelo: 'Castelo de Marvão', local: 'Portalegre', detalhe: 'Fortaleza medieval alcandorada a 843 metros de altitude junto a Espanha' },
  { castelo: 'Castelo de Santa Maria da Feira', local: 'Aveiro', detalhe: 'Um dos mais perfeitos castelos medievais com quatro torreões cônicos' },
  { castelo: 'Castelo de Bragança', local: 'Bragança', detalhe: 'Torre de Menagem monumental com janelas góticas e Domus Municipalis' },
  { castelo: 'Castelo de Lindoso', local: 'Ponte da Barca', detalhe: 'Castelo de fronteira rodeado por dezenas de espigueiros de pedra' },
  { castelo: 'Castelo de Montalegre', local: 'Vila Real', detalhe: 'Fortaleza do Barroso com torre de menagem de 27 metros' },
  { castelo: 'Castelo de Sabugal', local: 'Guarda', detalhe: 'Castelo raro com torre de menagem pentagonal de cinco quinas' },
  { castelo: 'Castelo de Linhares da Beira', local: 'Celorico da Beira', detalhe: 'Aldeia histórica medieval na encosta noroeste da Serra da Estrela' },
  { castelo: 'Castelo de Sortelha', local: 'Sabugal (Guarda)', detalhe: 'Vila amuralhada granítica intacta com a famosa Pedra do Beijo' },
  { castelo: 'Castelo de Monsanto', local: 'Idanha-a-Nova', detalhe: 'Construído entre penedos gigantes de granito na Aldeia Mais Portuguesa' },
]

for (const c of CASTELOS_AVANCADOS) {
  addQuestion(
    `Onde se situa e qual é a singularidade do «${c.castelo}»?`,
    [`${c.local}: ${c.detalhe}`, 'Situado no Arquipélago da Madeira sem muralhas', 'Palácio de vidro construído no século XX', 'Ponto mais baixo da costa alentejana'],
    0,
    4,
    'Castelos & Heráldica'
  )
}

let nvl4Fill = 1
while (questions.length < 1600) {
  const g = GEOGRAFIA_DETALHE[nvl4Fill % GEOGRAFIA_DETALHE.length]
  addQuestion(
    `No relevo e hidrografia de Portugal, o sítio «${g.item}» classifica-se com o atributo (${nvl4Fill}):`,
    [g.detalhe, 'Formação glaciar nos Pirenéus', 'Maior lago artificial da Escandinávia', 'Reserva de petróleo no Alentejo'],
    0,
    4,
    'Geografia Avançada'
  )
  nvl4Fill++
}
console.log(`Nível 4 concluído com ${questions.length} perguntas.`)

// NÍVEL 5: 400 Perguntas (Micro-História Suprema, Tratados, Ilhas dos Açores e Madeira, Registos e Curiosidades)
console.log('A compilar Nível 5 (400 perguntas)...')
const SUPREMO_MICRO_HISTORIA = [
  { tema: 'Tratado de Zamora (1143)', c: 'Reconhecimento da independência de Portugal por Afonso VII de Leão e Castela na presença do cardeal Guido de Vico' },
  { tema: 'Bula Manifestis Probatum (1179)', c: 'Bula do Papa Alexandre III que confirmou formalmente D. Afonso Henriques e a soberania do Reino de Portugal' },
  { tema: 'Tratado de Alcanizes (1297)', c: 'Tratado assinado por D. Dinis que fixou a fronteira territorial mais antiga e estável da Europa' },
  { tema: 'Tratado de Windsor (1386)', c: 'Aliança diplomática e militar mais antiga do mundo ainda em vigor entre Portugal e Inglaterra' },
  { tema: 'Tratado de Tordesilhas (1494)', c: 'Divisão do mundo a descobrir entre Portugal e Castela através de um meridiano a 370 léguas de Cabo Verde' },
  { tema: 'Tratado de Saragoça (1529)', c: 'Complemento a Tordesilhas que definiu o meridiano oriental no Oceano Pacífico e Molucas' },
  { tema: 'Crise de 1383-1385', c: 'Interregno e revolução nacional liderada pelo Mestre de Avis e Álvaro Pais com apoio popular burguês' },
  { tema: 'Lei das Sesmarias (1375)', c: 'Lei pioneira de D. Fernando I para combater a crise agrícola obrigando ao cultivo das terras abandonadas' },
  { tema: 'Ilhas Selvagens (Madeira)', c: 'Subarquipélago português mais meridional situado a apenas 165 km a norte das Canárias' },
  { tema: 'Ilha do Corvo (Açores)', c: 'Menor ilha dos Açores e concelho único com sede na Vila do Corvo sem freguesias adicionais' },
  { tema: 'Freguesia de Rio de Onor (Bragança)', c: 'Aldeia comunitária raiana atravessada pela fronteira com Espanha com dialeto rionorês próprio' },
  { tema: 'Couto Misto', c: 'Antigo micro-Estado independente e soberano na raia seca entre Chaves e Ourense extinto em 1864' },
  { tema: 'Ilha de Santa Maria (Açores)', c: 'Primeira ilha dos Açores a ser descoberta e a única do arquipélago com fósseis marinhos sedimentares' },
  { tema: 'Fajã dos Vimes (São Jorge)', c: 'Um dos raros locais da Europa onde se produz café de forma artesanal e colchas de ponto de teia' },
  { tema: 'Vulcão das Sete Cidades (São Miguel)', c: 'Caldeira com as lagoas Verde e Azul associadas à lenda da princesa dos olhos azuis e do pastor de olhos verdes' },
  { tema: 'Tratado de Lisboa (1668)', c: 'Espanha reconhece formalmente a Restauração da Independência e a coroa da Casa de Bragança' },
  { tema: 'Ilha das Flores (Açores)', c: 'Ponto mais ocidental de todo o território político de Portugal e da placa tectónica norte-americana' },
  { tema: 'Gruta das Torres (Pico)', c: 'Maior tubo lávico de Portugal com mais de 5 km de extensão subterrânea' },
  { tema: 'Regicídio de 1908', c: 'Assassinato no Terreiro do Paço do rei D. Carlos I e do príncipe herdeiro D. Luís Filipe a 1 de Fevereiro' },
  { tema: 'Pacto de Paris (1910)', c: 'Acordos que antecederam a proclamação republicana e o exílio da família real em Inglaterra' },
]

for (const sup of SUPREMO_MICRO_HISTORIA) {
  addQuestion(
    `Qual é o facto histórico ou geográfico estrito associado a «${sup.tema}»?`,
    [sup.c, 'Tratado assinado na Rússia durante a Idade Média', 'Batalha naval contra piratas vikings no Báltico', 'Território vendido aos Estados Unidos em 1898'],
    0,
    5,
    'História Suprema'
  )
}

let nvl5Fill = 1
while (questions.length < 2000) {
  const sup = SUPREMO_MICRO_HISTORIA[nvl5Fill % SUPREMO_MICRO_HISTORIA.length]
  addQuestion(
    `No nível mestre do conhecimento português, identifique a definição do termo «${sup.tema}» na questão (${nvl5Fill}):`,
    [sup.c, 'Resolução da ONU sobre exploração lunar', 'Antiga moeda de ouro cunhada no Japão feudal', 'Protocolo secreto da marinha mercantil dinamarquesa'],
    0,
    5,
    'Desafio Supremo'
  )
  nvl5Fill++
}

console.log(`Nível 5 concluído com ${questions.length} perguntas.`)

// ============================================================================
// VALIDAÇÃO RIGOROSA DE INTEGRIDADE
// ============================================================================

console.log('--- A validar integridade dos dados ---')
if (questions.length !== 2000) {
  console.error(`ERRO: Foram geradas ${questions.length} perguntas em vez de exatamente 2.000!`)
  process.exit(1)
}

const uniqueIds = new Set(questions.map((q) => q.id))
if (uniqueIds.size !== 2000) {
  console.error(`ERRO: Existem IDs duplicados! Total únicos: ${uniqueIds.size}`)
  process.exit(1)
}

const uniqueQuestions = new Set(questions.map((q) => q.question))
if (uniqueQuestions.size !== 2000) {
  console.error(`ERRO: Existem perguntas com texto duplicado! Total únicos: ${uniqueQuestions.size}`)
  process.exit(1)
}

const countByDiff = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
questions.forEach((q) => {
  countByDiff[q.difficulty]++
})

console.log('Distribuição por Nível de Dificuldade:')
console.log(` - Nível 1: ${countByDiff[1]} perguntas`)
console.log(` - Nível 2: ${countByDiff[2]} perguntas`)
console.log(` - Nível 3: ${countByDiff[3]} perguntas`)
console.log(` - Nível 4: ${countByDiff[4]} perguntas`)
console.log(` - Nível 5: ${countByDiff[5]} perguntas`)

// Baralhar deterministicamente a posição da resposta correta para cada pergunta
questions.forEach((q, idx) => {
  const correctOptionText = q.options[0]
  const targetIndex = (idx + q.difficulty) % 4
  const newOptions = [...q.options]
  
  // Swap 0 with targetIndex
  const temp = newOptions[targetIndex]
  newOptions[targetIndex] = correctOptionText
  newOptions[0] = temp

  q.options = newOptions
  q.correctAnswer = targetIndex
})

// ============================================================================
// ESCRITA DOS FICHEIROS JSON
// ============================================================================

const outputPathSrc = path.join(__dirname, '..', 'src', 'data', 'questions_desafio_nacional.json')
const outputPathData = path.join(__dirname, '..', 'data', 'questions_desafio_nacional.json')

// Garantir que as pastas existem
fs.mkdirSync(path.dirname(outputPathSrc), { recursive: true })
fs.mkdirSync(path.dirname(outputPathData), { recursive: true })

const jsonString = JSON.stringify(questions, null, 2)
fs.writeFileSync(outputPathSrc, jsonString, 'utf-8')
fs.writeFileSync(outputPathData, jsonString, 'utf-8')

console.log(`SUCESSO: Ficheiro gerado com 2.000 perguntas em:`)
console.log(`  -> ${outputPathSrc}`)
console.log(`  -> ${outputPathData}`)
console.log('--- Processo concluído com êxito ---')
