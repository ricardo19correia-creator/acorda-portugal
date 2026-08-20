/**
 * Utilitários oficiais dos Power-Ups do Quiz do Acorda Portugal
 */

/**
 * Escolhe exatamente 2 opções erradas para eliminar no modo 50/50
 * Mantém sempre a opção correta e exatamente 1 opção errada.
 */
export function calculate5050Eliminated<T extends string>(
  options: { key: T; text: string }[],
  correctKey: T,
): T[] {
  const wrongKeys = options
    .map((o) => o.key)
    .filter((k) => k !== correctKey)

  // Baralhar as erradas e retirar 2
  const shuffled = [...wrongKeys].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2)
}

/**
 * Gera uma pista contextual inteligente e educativa para a pergunta atual sem revelar a resposta diretamente
 */
export function generateQuestionClue(question: {
  question: string
  explanation?: string
  category?: string
  subcategory?: string
  district?: string
  city?: string
}): string {
  if (question.explanation && question.explanation.trim().length > 10) {
    // Limpar menções literais tipo "A resposta é A" se existirem
    const cleaned = question.explanation
      .replace(/^(a\s+resposta\s+correta\s+é\s+[a-d]:?\s*)/i, '')
      .replace(/^(opção\s+[a-d]\s+está\s+correta:?\s*)/i, '')
      .trim()

    // Se a explicação for longa, focar na primeira frase contextual
    const sentences = cleaned.split(/(?<=[.!?])\s+/)
    if (sentences.length > 0 && sentences[0].length >= 15) {
      return sentences[0]
    }
    return cleaned
  }

  // Fallback baseado em contexto territorial e temático
  if (question.district) {
    return `Pensa nas tradições, geografia ou património histórico do distrito de ${question.district}.`
  }

  if (question.city) {
    return `Este acontecimento ou localidade está intimamente ligado ao município de ${question.city}.`
  }

  if (question.category) {
    return `Analisa o contexto histórico e cultural português na área de «${question.category}».`
  }

  return 'Analisa cuidadosamente a cronologia e a relevância histórica das opções apresentadas.'
}
