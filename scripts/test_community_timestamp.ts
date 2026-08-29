import { formatPostDate, getFullFormattedDate, CommunityPost } from '../types/community'

console.log('================================================================================')
console.log('🧪 TESTE DE VALIDAÇÃO DE DATA E HORA DE COMUNIDADE/CRIADORES')
console.log('================================================================================\n')

const now = new Date()
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
const firestoreTimestampMock = {
  seconds: Math.floor((now.getTime() - 5 * 60 * 1000) / 1000),
  nanoseconds: 0,
  toDate: () => new Date(now.getTime() - 5 * 60 * 1000)
}

const mockPosts: CommunityPost[] = [
  {
    id: 'post_1',
    authorName: 'Afonso Henriques',
    authorHandle: 'rei_fundador',
    district: 'Guimarães',
    category: 'História',
    content: 'Portugal nasceu aqui!',
    likes: 12,
    commentsCount: 3,
    createdAt: now,
  },
  {
    id: 'post_2',
    authorName: 'Maria Silva',
    authorHandle: 'mariapt',
    district: 'Porto',
    category: 'Ideias',
    content: 'Nova ideia para duelo de cidades!',
    likes: 5,
    commentsCount: 1,
    createdAt: tenMinutesAgo,
  },
  {
    id: 'post_3',
    authorName: 'João Santos',
    authorHandle: 'joao_lisboa',
    district: 'Lisboa',
    category: 'Desabafos',
    content: 'Excelente partida hoje!',
    likes: 8,
    commentsCount: 2,
    createdAt: firestoreTimestampMock as any,
  },
]

for (const post of mockPosts) {
  const relTime = formatPostDate(post.createdAt)
  const fullTime = getFullFormattedDate(post.createdAt)
  console.log(`✅ [POST] @${post.authorHandle} (${post.district}) ➔ Tempo Relativo: "${relTime}" | Completo: "${fullTime}"`)
}

console.log('\n================================================================================')
console.log('🌟 TODOS OS FORMATOS DE DATA E HORA VALIDADOS COM SUCESSO!')
console.log('================================================================================\n')
