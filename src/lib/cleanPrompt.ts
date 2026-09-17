/**
 * Acorda Portugal — Sanitizador Canónico de Texto de Perguntas
 * 
 * REGRA ABSOLUTA:
 * O jogador vê APENAS o texto puro da pergunta (ex: "Quem foi o primeiro rei de Portugal?").
 * NUNCA renderizar categorias ("História #345", "Cultura #123"), IDs de pergunta,
 * níveis técnicos ("Nível 2"), códigos internos ou etiquetas fixas.
 * 
 * Metadados como id, categoria, subcategoria, dificuldade, etc. permanecem
 * intactos internamente nos objetos para lógica do jogo, Firebase, histórico e estatísticas.
 */

export function cleanQuestionPrompt(text: string): string {
  if (!text) return ''
  let cleaned = String(text).trim()

  let prev = ''
  let iterations = 0

  // Execução multi-passo para remover prefixos encadeados (ex: "[História] #123: ...")
  while (prev !== cleaned && iterations < 10) {
    prev = cleaned
    iterations++

    // 1. Remove etiquetas fechadas entre colchetes ou parêntesis:
    // [História #123], [Cultura], [#123], [ID: 123], [Nível 2], (História #123), etc.
    cleaned = cleaned.replace(
      /^\[\s*(?:[A-Za-zÀ-ÿ0-9_\s\-\/]+#\d+|#\d+|ID[:\s]*#?\w+|N[íi]vel\s*\w+|Dificuldade\s*\w+|Quest[aã]o\s*#?\d*|Pergunta\s*#?\d*|[A-Za-zÀ-ÿ\s]+)\s*\]\s*[-–—:.]*\s*/i,
      ''
    )
    cleaned = cleaned.replace(
      /^\(\s*(?:[A-Za-zÀ-ÿ0-9_\s\-\/]+#\d+|#\d+|ID[:\s]*#?\w+|N[íi]vel\s*\w+|Dificuldade\s*\w+|Quest[aã]o\s*#?\d*|Pergunta\s*#?\d*)\s*\)\s*[-–—:.]*\s*/i,
      ''
    )

    // 2. Remove categoria seguida de cardinal e número:
    // "História #345:", "Cultura #123 -", "Geografia #456:", "Desporto #789:",
    // "Ciência e Tecnologia #11:", "Portugal Questão #160:", etc.
    cleaned = cleaned.replace(/^[A-Za-zÀ-ÿ0-9_\s\-\/]+?#\d+\s*[:\-–—.]\s*/i, '')

    // 3. Remove prefixos técnicos genéricos com separador:
    // Modo Maluco, Desafio Visual, Desafio Nacional, Categoria, Tema, Subtema, Tópico, Pergunta, Questão
    cleaned = cleaned.replace(
      /^(?:Modo\s+Maluco|Desafio\s+Visual|Desafio\s+Nacional|Categoria|Tema|Subtema|T[óo]pico|Pergunta|Quest[aã]o)\s*(?:#?\d+)?\s*[:\-–—.]\s*/i,
      ''
    )

    // 4. Remove indicação de Nível ou Dificuldade no texto da pergunta:
    // "Nível 2:", "Nível: 2 -", "Nível Fácil -", "Dificuldade: Normal:", etc.
    cleaned = cleaned.replace(
      /^(?:N[íi]vel|Nivel|Dificuldade)\s*(?:[:\-–—.]\s*)?(?:#?\d+|F[áa]cil|Normal|M[ée]dio|Dif[íi]cil|Mestre)?\s*[:\-–—.]\s*/i,
      ''
    )

    // 5. Remove prefixos de ID isolados ou número cardinal isolado no início:
    // "ID: #999:", "Ref: 123 -", "Código: #456 -", "#123: "
    cleaned = cleaned.replace(/^(?:ID|Ref|C[óo]digo)\s*[:#\s]*\w+\s*[:\-–—.]\s*/i, '')
    cleaned = cleaned.replace(/^#\d+\s*[:\-–—.]\s*/, '')

    // 6. Remove pontuação órfã ou espaços deixados no início
    cleaned = cleaned.replace(/^[:\-–—.\s]+/, '').trim()
  }

  return cleaned
}
