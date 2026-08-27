import type { BotPersonality } from './types'

export type DuelEventType =
  | 'MATCH_START'
  | 'PLAYER_CORRECT'
  | 'BOT_CORRECT'
  | 'PLAYER_WRONG'
  | 'BOT_WRONG'
  | 'STREAK'
  | 'BOT_WIN'
  | 'BOT_LOSS'
  | 'PLAYER_WIN'
  | 'PLAYER_LOSS'
  | 'FINAL_QUESTION'

const TAUNT_DICTIONARY: Record<DuelEventType, Record<string, string[]>> = {
  MATCH_START: {
    CASUAL: ['Boa sorte! Que seja um bom jogo.', 'Olá! Vamos divertir-nos.', 'Pronto quando quiseres! 😊'],
    FRIENDLY: ['Muito gosto em jogar contigo!', 'Boa sorte para nós os dois! 🇵🇹', 'Vamos a isto com calma!'],
    COMPETITIVE: ['Prepara-te, estou em boa forma!', 'Que vença o melhor de Portugal!', 'Foco total nesta partida! ⚔️'],
    CONFIDENT: ['Estudei bem as perguntas de hoje 😎', 'Vamos ver quem domina este tema!', 'Que comece o duelo!'],
    PROVOCATIVE: ['Achas que consegues vencer este duelo?', 'Não vai ser fácil tirares-me pontos!', 'Boa sorte, vais precisar! 🔥'],
    SPECIALIST: ['Conheço bem os temas nacionais.', 'Curioso para ver a tua estratégia.', 'Vamos a um bom teste de conhecimento!'],
    NORMAL: ['Boa sorte!', 'Vamos a isto!', 'Pronto para o desafio!'],
  },
  PLAYER_CORRECT: {
    CASUAL: ['Boa resposta!', 'Bem visto!', 'Boa!'],
    FRIENDLY: ['Grande resposta!', 'Muito bem jogado!', 'Excelente! 👏'],
    COMPETITIVE: ['Essa foi rápida!', 'Boa jogada, mas ainda estamos no início.', 'Não posso dar espaço!'],
    CONFIDENT: ['Boa, mas a próxima é minha.', 'Estás rápido no gatilho!', 'Nada mau!'],
    PROVOCATIVE: ['Acertaste nessa, vamos ver a próxima.', 'Tiveste sorte agora!', 'Não te habitues! 😉'],
    SPECIALIST: ['Resposta correta e precisa.', 'Conheces bem este facto.', 'Bem lembrado.'],
    NORMAL: ['Boa resposta.', 'Certeiro!', 'Bem jogado.'],
  },
  BOT_CORRECT: {
    CASUAL: ['Boa, acertei esta!', 'Sabia esta de cabeça.', 'Ponto para mim! 😊'],
    FRIENDLY: ['Esta sabia bem!', 'Mais um ponto somado.', 'Correu bem esta!'],
    COMPETITIVE: ['Mais 100 pontos!', 'Acelerando o ritmo!', 'Dentro do plano! 🎯'],
    CONFIDENT: ['Esta era óbvia!', 'Fácil!', 'Domínio total nesta pergunta. 😎'],
    PROVOCATIVE: ['Estás a acompanhar o meu ritmo?', 'Ponto meu!', 'Ainda vais a tempo de recuperar?'],
    SPECIALIST: ['Facto histórico comprovado.', 'Esta é uma das minhas especialidades.', 'Sem margem para dúvidas.'],
    NORMAL: ['Acertei!', 'Mais um ponto.', 'Boa.'],
  },
  PLAYER_WRONG: {
    CASUAL: ['Essa era difícil!', 'Não era nada fácil esta.', 'Acontece aos melhores.'],
    FRIENDLY: ['Não desanimes, ainda há muitas perguntas!', 'Esta tinha rasteira.', 'Força, ainda recuperas!'],
    COMPETITIVE: ['Aproveitei a oportunidade!', 'Cada ponto conta.', 'Agora assumo a vantagem.'],
    CONFIDENT: ['Essa rasteira apanhou-te!', 'Estava atento a essa.', 'Cuidado com as opções!'],
    PROVOCATIVE: ['Essa doeu na pontuação!', 'Ficou mais fácil para mim agora.', 'Cuidado com a distração!'],
    SPECIALIST: ['Esta pergunta confunde muita gente.', 'A nuance histórica aqui era subtil.', 'Rasteira clássica.'],
    NORMAL: ['Essa era traiçoeira.', 'Não era simples.', 'Segue para a próxima.'],
  },
  BOT_WRONG: {
    CASUAL: ['Ups, falhei esta!', 'Enganei-me...', 'Não me lembrava bem desta.'],
    FRIENDLY: ['Bem, esta falhei redondamente!', 'Parabéns pela oportunidade!', 'Erro meu, bem aproveitado!'],
    COMPETITIVE: ['Não devia ter arriscado nessa!', 'Tenho de recuperar agora.', 'Foco redobrado!'],
    CONFIDENT: ['Fui demasiado depressa.', 'Distraí-me com o tempo.', 'Vou recuperar na próxima!'],
    PROVOCATIVE: ['Dei-te uma hipótese!', 'Foi só para dar emoção ao duelo!', 'Não cometo mais erros destes.'],
    SPECIALIST: ['Hesitei entre duas opções e escolhi mal.', 'Devia ter relido com atenção.', 'Rara falha neste tema.'],
    NORMAL: ['Falhei!', 'Erro meu.', 'Tenho de compensar.'],
  },
  STREAK: {
    CASUAL: ['Estás com uma grande sequência!', 'Que ritmo!', 'Não paras!'],
    FRIENDLY: ['Sequência incrível, parabéns!', 'Estás em chamas! 🔥', 'Que belo jogo estás a fazer!'],
    COMPETITIVE: ['Grande streak, mas vou travar-te!', 'Estás imparável, tenho de arriscar.', 'Jogo de alto nível!'],
    CONFIDENT: ['Belo streak, vamos ver se dura.', 'Impressionante, mas vou empatar!', 'Nada mau!'],
    PROVOCATIVE: ['Alguém que pare este ritmo!', 'A sorte está do teu lado hoje!', 'Ainda te apanho!'],
    SPECIALIST: ['Consistência impressionante de respostas.', 'Excelente domínio sequencial.', 'Muito sólido.'],
    NORMAL: ['Grande sequência!', 'Estás afiado!', 'Foco total.'],
  },
  BOT_WIN: {
    CASUAL: ['Boa partida! Foi divertido.', 'Obrigado pelo jogo! Até à próxima.', 'Bom jogo!'],
    FRIENDLY: ['Muito obrigado pela excelente partida!', 'Foi renhido até ao fim, parabéns!', 'Adorei jogar contigo! 🤝'],
    COMPETITIVE: ['Grande vitória! Partida muito intensa.', 'Mais uma para o ranking! Bem jogado.', 'Excelente duelo! 🏆'],
    CONFIDENT: ['Mais um triunfo merecido!', 'Foi um gosto! Quando quiseres a desforra, avisa.', 'Vitória!'],
    PROVOCATIVE: ['Vencedor! Fica para a próxima desforra 😉', 'O troféu fica deste lado!', 'Grande duelo!'],
    SPECIALIST: ['Excelente confronto de conhecimentos.', 'Partida de grande nível técnico.', 'Obrigado pelo desafio!'],
    NORMAL: ['Boa partida!', 'Bem jogado!', 'Obrigado pelo duelo.'],
  },
  BOT_LOSS: {
    CASUAL: ['Parabéns pela vitória!', 'Jogaste muito bem!', 'Merecida vitória tua.'],
    FRIENDLY: ['Muitos parabéns! Foste impecável.', 'Excelente partida, mereceste vencer! 👏', 'Até à próxima!'],
    COMPETITIVE: ['Grande jogo teu! Na próxima vou querer desforra.', 'Estiveste melhor, parabéns pela vitória!', 'Bem disputado.'],
    CONFIDENT: ['Parabéns, desta vez levaste a melhor.', 'Foste mais rápido hoje!', 'Na próxima não escapas!'],
    PROVOCATIVE: ['Ok, esta foi tua! Mas na desforra não vai ser assim.', 'Bem jogado, surpreendeste-me!', 'Parabéns pela vitória.'],
    SPECIALIST: ['Demonstraste excelente domínio dos temas.', 'Vitória merecida e consistente.', 'Parabéns pelo resultado!'],
    NORMAL: ['Parabéns pela vitória!', 'Bom jogo.', 'Bem disputado.'],
  },
  PLAYER_WIN: {
    CASUAL: ['Parabéns! Grande vitória tua.', 'Muito bem jogado!', 'Foi um gosto!'],
    FRIENDLY: ['Muitos parabéns! Foste superior em toda a partida.', 'Brilhante vitória! 🌟', 'Até à próxima!'],
    COMPETITIVE: ['Parabéns pela vitória! Duelo de alto nível.', 'Foste mais forte, parabéns!', 'Grande vitória.'],
    CONFIDENT: ['Vitória merecida! Para a próxima estarei ainda mais preparado.', 'Parabéns!', 'Bom jogo.'],
    PROVOCATIVE: ['Levaste a melhor hoje! Parabéns.', 'Parabéns pela vitória, até ao próximo duelo!', 'Boa!'],
    SPECIALIST: ['Excelente pontuação e consistência.', 'Parabéns pela vitória exemplar.', 'Muito bem.'],
    NORMAL: ['Parabéns!', 'Grande vitória.', 'Bem jogado.'],
  },
  PLAYER_LOSS: {
    CASUAL: ['Bom esforço! Estiveste perto.', 'Foi por pouco!', 'Até ao próximo jogo!'],
    FRIENDLY: ['Estiveste muito bem, foi decidido no detalhe!', 'Obrigado pelo ótimo duelo!', 'Até à próxima!'],
    COMPETITIVE: ['Foi renhido até à última! Bem disputado.', 'Grande partida.', 'Obrigado pelo duelo.'],
    CONFIDENT: ['Foi renhido!', 'Estiveste muito bem.', 'Bom jogo!'],
    PROVOCATIVE: ['Desta vez foi minha! Mas jogaste bem.', 'Obrigado pelo duelo!', 'Boa partida.'],
    SPECIALIST: ['A margem foi mínima.', 'Excelente desafio de conhecimentos.', 'Bem jogado.'],
    NORMAL: ['Foi um bom duelo!', 'Bem disputado.', 'Até à próxima.'],
  },
  FINAL_QUESTION: {
    CASUAL: ['Última pergunta! Tudo ou nada.', 'Chegámos ao fim!', 'Foco nesta última!'],
    FRIENDLY: ['Última pergunta! Boa sorte para nós!', 'Que vença o melhor nesta reta final!', 'Momento decisivo!'],
    COMPETITIVE: ['Pergunta final! É agora ou nunca!', 'Decisão nos últimos 100 pontos!', 'Concentração máxima! ⚡'],
    CONFIDENT: ['Tudo se decide aqui!', 'Hora da verdade!', 'Última cartada!'],
    PROVOCATIVE: ['Última oportunidade para me apanhares!', 'Quem não arrisca não ganha nesta última!', 'É agora!'],
    SPECIALIST: ['Pergunta decisiva do duelo.', 'Momento culminante da partida.', 'Atenção aos detalhes.'],
    NORMAL: ['Última pergunta!', 'Decisão final!', 'Boa sorte!'],
  },
}

/**
 * Seleciona uma mensagem contextual apropriada de acordo com o evento e personalidade do bot
 */
export function getBotContextualTaunt(
  event: DuelEventType,
  personality: BotPersonality | string = 'NORMAL'
): string {
  const eventBucket = TAUNT_DICTIONARY[event] || TAUNT_DICTIONARY.MATCH_START
  const list = eventBucket[personality] || eventBucket.NORMAL || ['Boa sorte!']
  const index = Math.floor(Math.random() * list.length)
  return list[index] || 'Boa sorte!'
}
