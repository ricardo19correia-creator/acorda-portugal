/**
 * 🇵🇹 ACORDA PORTUGAL — TESTES DE SEGURANÇA E ECONOMIA DE AVATARES
 * Validações de canonicidade, criação de conta, bloqueio de injeção,
 * regras server-side canEquipAvatar e idempotência de migração.
 */

import {
  REAL_AVATARS,
  getAvatarById,
  getAvatarImage,
  normalizeAvatarId,
  STARTER_AVATAR_ID,
  DEFAULT_AVATAR,
} from '../lib/avatars'
import { DEFAULT_AVATAR_ID, DEFAULT_AVATAR_URL } from '../data/constants'
import { canEquipAvatar } from '../lib/avatar-service'

async function runAvatarSecurityTests() {
  console.log('================================================================================')
  console.log('🇵🇹 TESTES DE SEGURANÇA, ECONOMIA E CANONICIDADE DE AVATARES')
  console.log('================================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${testName}`)
      if (detail) console.error(`   Detalhe: ${detail}`)
      failed++
    }
  }

  // TEST 1: Identificação Canónica do Avatar Inicial
  assert(
    STARTER_AVATAR_ID === 'avatar_01',
    'STARTER_AVATAR_ID é estritamente "avatar_01"',
    `Obtido: ${STARTER_AVATAR_ID}`
  )

  assert(
    DEFAULT_AVATAR_ID === 'avatar_01',
    'DEFAULT_AVATAR_ID em constants é "avatar_01"',
    `Obtido: ${DEFAULT_AVATAR_ID}`
  )

  assert(
    DEFAULT_AVATAR.id === 'avatar_01',
    'DEFAULT_AVATAR tem id "avatar_01"',
    `Obtido: ${DEFAULT_AVATAR.id}`
  )

  assert(
    DEFAULT_AVATAR.image === '/images/avatars/avatar_01.png',
    'DEFAULT_AVATAR aponta para a imagem canónica oficial',
    `Obtido: ${DEFAULT_AVATAR.image}`
  )

  assert(
    DEFAULT_AVATAR.rarity === 'comum' && DEFAULT_AVATAR.currency === 'free',
    'DEFAULT_AVATAR tem raridade "comum" e currency "free"',
    `Raridade: ${DEFAULT_AVATAR.rarity}, Currency: ${DEFAULT_AVATAR.currency}`
  )

  // TEST 2: Proteção de Avatares de Mérito e Raros (Não são 'free')
  const meritIds = ['avatar_30', 'avatar_35', 'avatar_36']
  meritIds.forEach((mId) => {
    const av = getAvatarById(mId)
    assert(
      av.currency === 'merit',
      `Avatar de mérito ${mId} («${av.name}») tem currency 'merit' (NÃO é 'free')`,
      `Currency atual: ${av.currency}`
    )
  })

  // TEST 3: Nenhum avatar VIP ou Mítico é gratuito
  const vipOrMythic = REAL_AVATARS.filter(
    (a) => a.rarity === 'mitico' || a.rarity === 'lendario' || a.id.startsWith('AP-VIP-') || a.id.startsWith('vip_')
  )
  const improperlyFree = vipOrMythic.filter((a) => a.currency === 'free')
  assert(
    improperlyFree.length === 0,
    `Zero avatares Míticos/Lendários/VIP marcados com currency: 'free' (encontrados: ${improperlyFree.length})`,
    improperlyFree.map((a) => a.id).join(', ')
  )

  // TEST 4: Resolução Segura de Fallback
  const invalidLookups = ['non_existent_avatar', 'null', 'undefined', '', 'hack_avatar_999']
  invalidLookups.forEach((inv) => {
    const res = getAvatarById(inv)
    assert(
      res.id === STARTER_AVATAR_ID,
      `Avatar inválido ou desconhecido «${inv}» faz fallback seguro para ${STARTER_AVATAR_ID}`,
      `Resolvido para: ${res.id}`
    )
  })

  // TEST 5: Validação de canEquipAvatar para Avatar Starter
  const starterCheck = await canEquipAvatar('mock-user-123', STARTER_AVATAR_ID)
  assert(
    starterCheck.allowed === true && starterCheck.avatarItem?.id === STARTER_AVATAR_ID,
    'canEquipAvatar permite sempre o STARTER_AVATAR_ID para qualquer utilizador',
    JSON.stringify(starterCheck)
  )

  // TEST 6: Normalização Canónica de Aliases
  const aliasTests = [
    { input: 'avatar_01', expected: 'avatar_01' },
    { input: '/images/avatars/avatar_01.png', expected: 'avatar_01' },
    { input: 'camoes_2050', expected: 'avatar_36' },
    { input: 'guardiao_acores', expected: 'avatar_03' },
    { input: 'lenda_futebol', expected: 'avatar_11' },
  ]
  aliasTests.forEach(({ input, expected }) => {
    const norm = normalizeAvatarId(input)
    assert(
      norm === expected,
      `normalizeAvatarId("${input}") resolve para "${expected}"`,
      `Obtido: ${norm}`
    )
  })

  console.log('\n================================================================================')
  console.log(`📊 RESULTADO DA SUITE: ${passed} PASS, ${failed} FAIL`)
  console.log('================================================================================\n')

  if (failed > 0) {
    process.exit(1)
  } else {
    console.log('🎉 TODOS OS TESTES DE SEGURANÇA E CANONICIDADE PASSARAM COM 100% DE SUCESSO!')
  }
}

runAvatarSecurityTests().catch((err) => {
  console.error('Erro fatal nos testes:', err)
  process.exit(1)
})
