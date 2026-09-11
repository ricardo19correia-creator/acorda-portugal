/**
 * 🇵🇹 DADOS FACTUAIS BASE DE PORTUGAL PARA O GERADOR 472K
 */

const REIS_PORTUGAL = [
  { nome: 'D. Afonso Henriques', cognome: 'O Conquistador', dinastia: 'Afonsina (1ª)', ano: 1143, feito: 'Fundador do Reino de Portugal e vencedor da Batalha de Ourique' },
  { nome: 'D. Sancho I', cognome: 'O Povoador', dinastia: 'Afonsina (1ª)', ano: 1185, feito: 'Incentivou o povoamento de terras e a agricultura nacional' },
  { nome: 'D. Afonso II', cognome: 'O Gordo', dinastia: 'Afonsina (1ª)', ano: 1211, feito: 'Convocou as primeiras Cortes de Coimbra em 1211' },
  { nome: 'D. Sancho II', cognome: 'O Capelo', dinastia: 'Afonsina (1ª)', ano: 1223, feito: 'Deposto pelo Papa Inocêncio IV na crise sucessória de 1245' },
  { nome: 'D. Afonso III', cognome: 'O Bolonhês', dinastia: 'Afonsina (1ª)', ano: 1248, feito: 'Conquistou definitivamente o Algarve em 1249 fixando as fronteiras' },
  { nome: 'D. Dinis', cognome: 'O Lavrador / O Rei Poeta', dinastia: 'Afonsina (1ª)', ano: 1279, feito: 'Fundou a Universidade em 1290 e plantou o Pinhal de Leiria' },
  { nome: 'D. Afonso IV', cognome: 'O Bravo', dinastia: 'Afonsina (1ª)', ano: 1325, feito: 'Venceu a histórica Batalha do Salado em 1340 contra os mouros' },
  { nome: 'D. Pedro I', cognome: 'O Justiceiro / O Cruel', dinastia: 'Afonsina (1ª)', ano: 1357, feito: 'Protagonizou o trágico amor com D. Inês de Castro' },
  { nome: 'D. Fernando I', cognome: 'O Formoso / O Inconstante', dinastia: 'Afonsina (1ª)', ano: 1367, feito: 'Promulgou a Lei das Sesmarias para fomentar a agricultura' },
  { nome: 'D. João I', cognome: 'O de Boa Memória', dinastia: 'Avis (2ª)', ano: 1385, feito: 'Mestre de Avis e líder na vitória de Aljubarrota em 1385' },
  { nome: 'D. Duarte', cognome: 'O Eloquente', dinastia: 'Avis (2ª)', ano: 1433, feito: 'Escreveu a obra filosófica e moral Leal Conselheiro' },
  { nome: 'D. Afonso V', cognome: 'O Africano', dinastia: 'Avis (2ª)', ano: 1438, feito: 'Conquistou praças no Norte de África como Alcácer-Ceguer e Arzila' },
  { nome: 'D. João II', cognome: 'O Príncipe Perfeito', dinastia: 'Avis (2ª)', ano: 1481, feito: 'Assinou o Tratado de Tordesilhas em 1494 dividindo o mundo' },
  { nome: 'D. Manuel I', cognome: 'O Venturoso', dinastia: 'Avis (2ª)', ano: 1495, feito: 'Reinou durante as chegadas à Índia e ao Brasil e deu nome ao estilo Manuelino' },
  { nome: 'D. João III', cognome: 'O Piedoso', dinastia: 'Avis (2ª)', ano: 1521, feito: 'Introduziu a Inquisição em Portugal e fundou o Colégio das Artes' },
  { nome: 'D. Sebastião', cognome: 'O Desejado', dinastia: 'Avis (2ª)', ano: 1557, feito: 'Desapareceu tragicamente na Batalha de Alcácer-Quibir em 1578' },
  { nome: 'D. Henrique', cognome: 'O Casto / Cardeal-Rei', dinastia: 'Avis (2ª)', ano: 1578, feito: 'Último rei da Dinastia de Avis antes da União Ibérica' },
  { nome: 'D. João IV', cognome: 'O Restaurador', dinastia: 'Bragança (4ª)', ano: 1640, feito: 'Aclamado rei após o 1º de Dezembro de 1640 restaurando a independência' },
  { nome: 'D. Afonso VI', cognome: 'O Vitorioso', dinastia: 'Bragança (4ª)', ano: 1656, feito: 'Assegurou vitórias militares decisivas na Guerra da Restauração' },
  { nome: 'D. Pedro II', cognome: 'O Pacífico', dinastia: 'Bragança (4ª)', ano: 1683, feito: 'Assinou o Tratado de Methuen em 1703 com a Grã-Bretanha' },
  { nome: 'D. João V', cognome: 'O Magnânimo', dinastia: 'Bragança (4ª)', ano: 1706, feito: 'Mandou construir o monumental Convento de Mafra e o Aqueduto das Águas Livres' },
  { nome: 'D. José I', cognome: 'O Reformador', dinastia: 'Bragança (4ª)', ano: 1750, feito: 'Enfrentou o Terramoto de 1755 e apoiou as reformas do Marquês de Pombal' },
  { nome: 'D. Maria I', cognome: 'A Pia / A Louca', dinastia: 'Bragança (4ª)', ano: 1777, feito: 'Primeira rainha reinante de Portugal e fundadora da Basílica da Estrela' },
  { nome: 'D. João VI', cognome: 'O Clemente', dinastia: 'Bragança (4ª)', ano: 1816, feito: 'Transferiu a corte para o Rio de Janeiro durante as Invasões Francesas' },
  { nome: 'D. Pedro IV', cognome: 'O Rei-Soldado', dinastia: 'Bragança (4ª)', ano: 1826, feito: 'Outorgou a Carta Constitucional de 1826 e defendeu o liberalismo' },
  { nome: 'D. Miguel I', cognome: 'O Tradicionalista / O Absolutista', dinastia: 'Bragança (4ª)', ano: 1828, feito: 'Liderou a fação absolutista durante a Guerra Civil Portuguesa' },
  { nome: 'D. Maria II', cognome: 'A Educadora', dinastia: 'Bragança (4ª)', ano: 1834, feito: 'Restabeleceu definitivamente a monarquia constitucional liberal' },
  { nome: 'D. Carlos I', cognome: 'O Diplomata / O Oceanógrafo', dinastia: 'Bragança (4ª)', ano: 1889, feito: 'Pioneiro da oceanografia em Portugal e vítima do Regicídio de 1908' },
  { nome: 'D. Manuel II', cognome: 'O Patriota / O Desventurado', dinastia: 'Bragança (4ª)', ano: 1908, feito: 'Último rei de Portugal, deposto na Revolução Republicana de 1910' },
];

const BATALHAS_HISTORICAS = [
  { nome: 'Batalha de Ourique', ano: 1139, local: 'Baixo Alentejo', vencedor: 'D. Afonso Henriques', contexto: 'Momento lendário onde Afonso Henriques foi aclamado rei pelos seus soldados após derrotar cinco reis mouros' },
  { nome: 'Batalha de Aljubarrota', ano: 1385, local: 'Leiria / Batalha', vencedor: 'D. João I e Nuno Álvares Pereira', contexto: 'Vitória decisiva com a tática do quadrado contra o exército castelhano, garantindo a independência nacional' },
  { nome: 'Batalha dos Atoleiros', ano: 1384, local: 'Fronteira (Alentejo)', vencedor: 'Nuno Álvares Pereira', contexto: 'Primeira vitória militar de D. Nuno Álvares Pereira recorrendo a táticas de infantaria sem sofrer baixas' },
  { nome: 'Batalha de Alcácer-Quibir', ano: 1578, local: 'Norte de Marrocos', vencedor: 'Exército Marroquino', contexto: 'Derrota trágica que ditou o desaparecimento de D. Sebastião e a consequente crise dinástica de 1580' },
  { nome: 'Batalha das Linhas de Elvas', ano: 1659, local: 'Elvas', vencedor: 'Exército Português (Conde de Cantanhede)', contexto: 'Batalha fundamental na Guerra da Restauração que travou a invasão espanhola do Alentejo' },
  { nome: 'Batalha de Montes Claros', ano: 1665, local: 'Borba / Vila Viçosa', vencedor: 'Marquês de Marialva e Schomberg', contexto: 'Última grande batalha campal da Guerra da Restauração, consolidando a independência portuguesa' },
  { nome: 'Batalha do Buçaco', ano: 1810, local: 'Serra do Buçaco', vencedor: 'Exército Anglo-Luso (Wellington)', contexto: 'Travou o avanço das tropas napoleónicas comandadas pelo marechal Massena durante a terceira invasão francesa' },
  { nome: 'Batalha de São Mamede', ano: 1128, local: 'Guimarães', vencedor: 'D. Afonso Henriques', contexto: 'Confronto entre Afonso Henriques e os partidários de sua mãe D. Teresa, marcando o início da autonomia portuguesa' },
  { nome: 'Batalha de La Lys', ano: 1918, local: 'Flandres (França)', vencedor: 'Alemanha (Primeira Guerra Mundial)', contexto: 'Resistência heroica e trágica do Corpo Expedicionário Português (CEP) na Frente Ocidental' },
];

const MONUMENTOS_PORTUGAL = [
  { nome: 'Mosteiro dos Jerónimos', local: 'Lisboa (Belém)', estilo: 'Manuelino', seculo: 'Século XVI', curiosidade: 'Alberga os túmulos de Vasco da Gama e de Luís de Camões' },
  { nome: 'Torre de Belém', local: 'Lisboa', estilo: 'Manuelino', seculo: 'Século XVI', curiosidade: 'Monumento defensivo erguido nas águas do Tejo no reinado de D. Manuel I' },
  { nome: 'Convento de Cristo', local: 'Tomar', estilo: 'Românico, Gótico e Manuelino', seculo: 'Século XII a XVI', curiosidade: 'Antiga sede histórica da Ordem dos Templários e da Ordem de Cristo, famosa pela Janela Manuelina' },
  { nome: 'Mosteiro da Batalha', local: 'Batalha (Leiria)', estilo: 'Gótico e Manuelino', seculo: 'Século XIV', curiosidade: 'Construído em cumprimento de um voto de D. João I pela vitória em Aljubarrota' },
  { nome: 'Mosteiro de Alcobaça', local: 'Alcobaça', estilo: 'Gótico Cisterciense', seculo: 'Século XII', curiosidade: 'Acolhe os túmulos frente a frente dos apaixonados D. Pedro I e D. Inês de Castro' },
  { nome: 'Palácio Nacional da Pena', local: 'Sintra', estilo: 'Romantismo Revivalista', seculo: 'Século XIX', curiosidade: 'Concebido pelo rei consorte D. Fernando II no topo da Serra de Sintra' },
  { nome: 'Templo Romano de Évora', local: 'Évora', estilo: 'Romano Coríntio', seculo: 'Século I', curiosidade: 'Popularmente chamado de Templo de Diana, um dos vestígios romanos mais bem preservados da Península' },
  { nome: 'Castelo de Guimarães', local: 'Guimarães', estilo: 'Românico Medieval', seculo: 'Século X', curiosidade: 'Conhecido como o Berço da Nação e local tradicional de nascimento de D. Afonso Henriques' },
  { nome: 'Sé Velha de Coimbra', local: 'Coimbra', estilo: 'Românico', seculo: 'Século XII', curiosidade: 'Uma das catedrais românicas mais autênticas e bem conservadas de Portugal' },
  { nome: 'Palácio de Mateus', local: 'Vila Real', estilo: 'Barroco', seculo: 'Século XVIII', curiosidade: 'Obra-prima do arquiteto Nicolau Nasoni, com espelho de água e jardins majestosos' },
  { nome: 'Santuário do Bom Jesus do Monte', local: 'Braga', estilo: 'Barroco e Neoclássico', seculo: 'Século XVIII', curiosidade: 'Famoso pelo monumental escadório dos Cinco Sentidos e pelo funicular movido a água' },
  { nome: 'Torre dos Clérigos', local: 'Porto', estilo: 'Barroco', seculo: 'Século XVIII', curiosidade: 'Projetada por Nicolau Nasoni, foi durante décadas a estrutura mais alta do país' },
  { nome: 'Castelo de Almourol', local: 'Vila Nova da Barquinha (Santarém)', estilo: 'Templário Medieval', seculo: 'Século XII', curiosidade: 'Erguido numa ilhota rochosa no meio do Rio Tejo' },
  { nome: 'Capela dos Ossos', local: 'Évora (Igreja de S. Francisco)', estilo: 'Barroco Macabro', seculo: 'Século XVII', curiosidade: 'Famosa pelo aviso à entrada: «Nós ossos que aqui estamos pelos vossos esperamos»' },
];

const GEOGRAFIA_PORTUGAL = [
  { elemento: 'Rio Tejo', tipo: 'Rio', detalhe: 'Maior rio da Península Ibérica, desagua no Mar da Palha em Lisboa' },
  { elemento: 'Rio Douro', tipo: 'Rio', detalhe: 'Nasce em Espanha (Picos de Urbión) e desagua entre o Porto e Vila Nova de Gaia' },
  { elemento: 'Rio Mondego', tipo: 'Rio', detalhe: 'O maior rio que nasce e corre inteiramente em território de Portugal Continental' },
  { elemento: 'Rio Guadiana', tipo: 'Rio', detalhe: 'Faz a fronteira sul (raia) com Espanha e alimenta o grande lago do Alqueva' },
  { elemento: 'Rio Sado', tipo: 'Rio', detalhe: 'Nasce na Serra da Vigia e corre de sul para norte, desaguando em Setúbal' },
  { elemento: 'Serra da Estrela', tipo: 'Montanha', detalhe: 'Maior cordilheira de Portugal Continental, com o ponto mais alto na Torre (1993 metros)' },
  { elemento: 'Montanha do Pico', tipo: 'Vulcão / Montanha', detalhe: 'O ponto mais alto de todo o território nacional (2351 metros), na ilha do Pico nos Açores' },
  { elemento: 'Cabo da Roca', tipo: 'Cabo', detalhe: 'O ponto mais ocidental de todo o continente europeu («Onde a terra acaba e o mar começa»)' },
  { elemento: 'Cabo de São Vicente', tipo: 'Cabo', detalhe: 'O ponto mais a sudoeste de Portugal Continental, no município de Sagres (Algarve)' },
  { elemento: 'Ria de Aveiro', tipo: 'Laguna / Ria', detalhe: 'Famosa pelos seus esteiros, canais urbanos, moliceiros e marinhas de sal' },
  { elemento: 'Ria Formosa', tipo: 'Parque Natural / Laguna', detalhe: 'Sistema de ilhas-barreira no Sotavento Algarvio com enorme biodiversidade' },
  { elemento: 'Arquipélago dos Açores', tipo: 'Arquipélago', detalhe: 'Composto por 9 ilhas de origem vulcânica divididas em três grupos (Ocidental, Central e Oriental)' },
  { elemento: 'Arquipélago da Madeira', tipo: 'Arquipélago', detalhe: 'Composto pelas ilhas da Madeira, Porto Santo, Ilhas Desertas e Ilhas Selvagens' },
];

const CLUBES_FUTEBOL = [
  { clube: 'Sport Lisboa e Benfica', alcunha: 'Águias / Encarnados', estadio: 'Estádio da Luz', titulos: 'Maior vencedor de campeonatos nacionais em Portugal (38 títulos)' },
  { clube: 'Futebol Clube do Porto', alcunha: 'Dragões / Azuis e Brancos', estadio: 'Estádio do Dragão', titulos: 'Bicampeão europeu (1987 e 2004) e vencedor de duas Taças UEFA/Liga Europa' },
  { clube: 'Sporting Clube de Portugal', alcunha: 'Leões / Verde e Brancos', estadio: 'Estádio José Alvalade', titulos: 'Conquistou a Taça das Taças em 1964 e formou Cristiano Ronaldo e Luís Figo' },
  { clube: 'Sporting Clube de Braga', alcunha: 'Guerreiros do Minho', estadio: 'Estádio Municipal de Braga (A Pedreira)', titulos: 'Vencedor da Taça de Portugal e finalista da Liga Europa em 2011' },
  { clube: 'Vitória Sport Clube (Guimarães)', alcunha: 'Conquistadores', estadio: 'Estádio D. Afonso Henriques', titulos: 'Clube histórico com uma das massas adeptas mais fervorosas do país' },
  { clube: 'Boavista Futebol Clube', alcunha: 'Axadrezados / Panteras', estadio: 'Estádio do Bessa', titulos: 'Campeão Nacional da Primeira Liga na histórica época 2000/2001' },
  { clube: 'Clube de Futebol Os Belenenses', alcunha: 'Azuis do Restelo', estadio: 'Estádio do Restelo', titulos: 'Campeão Nacional da Primeira Liga na histórica época 1945/1946' },
  { clube: 'Associação Académica de Coimbra', alcunha: 'Briosa / Estudantes', estadio: 'Estádio Cidade de Coimbra', titulos: 'Vencedor da primeira edição da Taça de Portugal em 1939' },
];

const GASTRONOMIA_FACTOS = [
  { prato: 'Francesinha', regiao: 'Porto', detalhe: 'Sanduíche recheada com carnes, coberta de queijo derretido e molho picante à base de cerveja e tomate' },
  { prato: 'Cozido à Portuguesa', regiao: 'Nacional (Tradição em todo o país)', detalhe: 'Prato rico composto por diversas carnes, enchidos tradicionais e legumes cozidos' },
  { prato: 'Bacalhau à Brás', regiao: 'Lisboa (Bairro Alto)', detalhe: 'Preparado com bacalhau desfiado, batata palha fina, ovos mexidos e salsa picada' },
  { prato: 'Alheira de Mirandela', regiao: 'Trás-os-Montes', detalhe: 'Enchido inventado pelos cristãos-novos no século XV sem carne de porco para evitar perseguições' },
  { prato: 'Pastéis de Nata / Belém', regiao: 'Lisboa (Belém)', detalhe: 'Criados pelos monges do Mosteiro dos Jerónimos antes de 1834, célebres com canela e açúcar em pó' },
  { prato: 'Ovos Moles', regiao: 'Aveiro', detalhe: 'Doce conventual envolvido em obreia com formas marítimas (conchas, peixes e búzios)' },
  { prato: 'Polvo à Lagareiro', regiao: 'Beiras / Ribatejo', detalhe: 'Polvo assado no forno acompanhado de batatas a murro e regado generosamente com azeite e alho' },
  { prato: 'Queijo da Serra da Estrela', regiao: 'Serra da Estrela', detalhe: 'Queijo curado de ovelha de pasta semimole e amanteigada coalhado com flor de cardo' },
  { prato: 'Vinho do Porto', regiao: 'Alto Douro Vinhateiro', detalhe: 'Vinho licoroso fortificado produzido na mais antiga região demarcada do mundo (1756)' },
  { prato: 'Pudim Abade de Priscos', regiao: 'Braga', detalhe: 'Doce tradicional conventual feito com toucinho de porco fresco, gemas de ovo e caramelo' },
];

const VILA_REAL_FACTOS = [
  { tema: 'Circuito Internacional de Vila Real', facto: 'Fundado em 1931 por Aureliano Barrigas, um dos circuitos citadinos mais míticos e velozes do automobilismo mundial' },
  { tema: 'Palácio de Mateus', facto: 'Edificado no século XVIII com traço atribuído a Nicolau Nasoni, ex-líbris do barroco com jardins deslumbrantes' },
  { tema: 'Diogo Cão', facto: 'Ilustre navegador nascido em Vila Real que descobriu a foz do Rio Congo e colocou os primeiros padrões em África' },
  { tema: 'Barro Preto de Bisalhães', facto: 'Processo tradicional de olaria em forno de lenha na terra com queima abafada, inscrito pela UNESCO como Património Imaterial' },
  { tema: 'Covilhetes de Vila Real', facto: 'Empadas tradicionais recheadas com carne de vaca picada estufada com cebola e especiarias em massa folhada' },
  { tema: 'Pitos de Santa Luzia', facto: 'Doce tradicional em formato quadrado de lenço recheado com doce de abóbora e canela' },
  { tema: 'Sé Catedral de Vila Real', facto: 'Antiga Igreja de São Domingos do convento dominicano, fundada no século XV' },
  { tema: 'UTAD', facto: 'Universidade de Trás-os-Montes e Alto Douro, polo universitário de referência nacional em ciências agrárias e veterinária' },
  { tema: 'Santuário de Panóias', facto: 'Recinto religioso rupestre luso-romano situado em Vale de Nogueiras dedicado a rituais e sacrifícios' },
  { tema: 'Serra do Marão', facto: 'Imponente barreira montanhosa entre o litoral e Trás-os-Montes, com mais de 1400 metros de altitude' },
];

const MODO_MALUCO_TEMAS = [
  {
    q: 'Se um galo botar um ovo exatamente no cimo de um telhado pontiagudo entre Portugal e Espanha, para que lado cai o ovo?',
    opts: ['Para o lado de Portugal', 'Para o lado de Espanha', 'Galo não bota ovos', 'Fica equilibrado no cimo'],
    correct: 2,
    exp: 'Galos são machos e não botam ovos, quem bota ovos são as galinhas!'
  },
  {
    q: 'O que é que tem dentes mas não consegue mastigar nem morder?',
    opts: ['O alho', 'O pente', 'A serra', 'O garfo'],
    correct: 1,
    exp: 'O pente tem dentes para pentear o cabelo, mas não mastiga nada!'
  },
  {
    q: 'O que é que anda com a barriga para o ar e a cabeça para o chão sem cair?',
    opts: ['A lagartixa', 'A minhoca', 'O morcego', 'O caracol'],
    correct: 2,
    exp: 'O morcego dorme pendurado de cabeça para baixo nas grutas e telhados!'
  },
  {
    q: 'Se comeres um pastel de Belém e soprares com força para cima, o que acontece à canela?',
    opts: ['Espalha-se e vai para os olhos', 'Transforma-se em açúcar', 'O pastel voa', 'Desaparece no ar'],
    correct: 0,
    exp: 'Se soprares para um pastel polvilhado com canela fina, vais certamente tossir com o pó no ar!'
  },
  {
    q: 'Quantos meses no ano têm exatamente 28 dias?',
    opts: ['Apenas Fevereiro', 'Nenhum mês', 'Todos os 12 meses', 'Dois meses nos anos bissextos'],
    correct: 2,
    exp: 'Todos os 12 meses têm pelo menos 28 dias; alguns têm 30 ou 31, mas todos passam pelo dia 28!'
  },
  {
    q: 'O que é que quanto mais seca, mais molhada fica?',
    opts: ['A toalha', 'A esponja', 'A chuva', 'A sopa'],
    correct: 0,
    exp: 'À medida que a toalha seca o teu corpo, ela absorve a água e fica molhada!'
  },
  {
    q: 'O que é que podes partir sem nunca tocar nem deitar ao chão?',
    opts: ['Um copo', 'Uma promessa', 'Um prato', 'Uma telha'],
    correct: 1,
    exp: 'Uma promessa parte-se quando não é cumprida, sem precisar de contacto físico!'
  },
  {
    q: 'Se tiveres três maçãs e tirares duas da fruteira, com quantas maçãs ficas na mão?',
    opts: ['Com uma maçã', 'Com três maçãs', 'Com duas maçãs', 'Com nenhuma maçã'],
    correct: 2,
    exp: 'Se tiraste duas maçãs, tens exatamente as duas maçãs que tiraste contigo!'
  }
];

module.exports = {
  REIS_PORTUGAL,
  BATALHAS_HISTORICAS,
  MONUMENTOS_PORTUGAL,
  GEOGRAFIA_PORTUGAL,
  CLUBES_FUTEBOL,
  GASTRONOMIA_FACTOS,
  VILA_REAL_FACTOS,
  MODO_MALUCO_TEMAS
};
