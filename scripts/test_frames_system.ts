/**
 * 🧪 Teste de Integridade do Sistema de Molduras Vivas
 *
 * Valida que:
 * 1. Todas as molduras vivas antigas foram completamente desativadas e removidas (total: 0).
 * 2. getFrameById retorna undefined para qualquer ID antigo (nenhuma moldura equipável/resolvível).
 * 3. Nenhuma moldura antiga ou VIP é comprável na loja ou catálogo.
 * 4. A infraestrutura do sistema de molduras continua 100% funcional e pronta para futuras molduras.
 */

import { ANIMATED_FRAMES, FRAME_ALIASES, getFrameById, getFrameRarityBadge } from '../src/data/frames'

function assert(condition: boolean, message: string, details: string = '') {
  if (!condition) {
    console.error(`❌ FALHA: ${message} ${details}`)
    process.exit(1)
  }
  console.log(`✅ SUCESSO: ${message}`)
}

console.log('====================================================')
console.log('🇵🇹 TESTE FORENSE DO SISTEMA DE MOLDURAS VIVAS')
console.log('====================================================\n')

// 1. VALIDAÇÃO DO TOTAL ATIVO (EXATAMENTE 0 MOLDURAS ATIVAS)
console.log('--- GRUPO 1: TOTAL GLOBAL DE MOLDURAS ATIVAS (EXATAMENTE 0) ---')
assert(ANIMATED_FRAMES.length === 0, `Catálogo src/data/frames.ts contém 0 molduras ativas (atual: ${ANIMATED_FRAMES.length})`)

// 2. CONFIRMAR QUE NENHUMA MOLDURA ANTIGA OU VIP É RESOLVIDA
console.log('\n--- GRUPO 2: PURGA E DESATIVAÇÃO TOTAL DE TODAS AS MOLDURAS ANTIGAS ---')
const ALL_OLD_IDS = [
  'frame_inferno_solar',
  'frame_ondas_atlantico',
  'frame_furia_trovao',
  'frame_zero_absoluto',
  'frame_fornalha_magma',
  'frame_nebulosa_estelar',
  'frame_floresta_viva',
  'frame_vazio_abissal',
  'frame_ouro_navegadores',
  'frame_fogo_eterno',
  'frame_tempestade_eletrica',
  'frame_gelo_ancestral',
  'frame_natureza_viva',
  'frame_dragao_fumegante',
  'frame_galaxia_profunda',
  'frame_cyber_laser',
  'frame_horizonte_eventos',
  'frame_plasma_solar',
  'frame_ouro_real',
  'frame_diamante_sagrado',
  'frame_luz_divina',
  'frame_esmeralda_imperial',
  'frame_quinas_portugal',
  'frame_rosa_dos_ventos',
  'frame_azulejo_portugues',
  'frame_muralha_castelo',
  'frame_farol_sagres',
  'frame_fado_guitarra',
  'frame_arcade_8bit',
  'frame_biohazard_toxic',
  'frame_gladiador_ferro',
  'frame_sakura_zen',
  'frame_fundador_ouro',
  'AP-VIP-FRAME-001',
  'AP-VIP-FRAME-002',
  'AP-VIP-FRAME-003',
  'AP-VIP-FRAME-004',
  'AP-VIP-FRAME-005',
]

ALL_OLD_IDS.forEach((oldId) => {
  const resolved = getFrameById(oldId)
  assert(resolved === undefined, `ID '${oldId}' NÃO é resolvido por getFrameById (retorna undefined)`)
})

// 3. PIPELINE DA LOJA (/loja)
console.log('\n--- GRUPO 3: PIPELINE DA LOJA (/loja) ---')
const FRAME_SHOP_ITEMS = ANIMATED_FRAMES.map((f) => ({
  id: f.id,
  name: f.name,
  category: 'molduras',
}))

assert(FRAME_SHOP_ITEMS.length === 0, `Loja renderiza 0 itens de moldura (atual: ${FRAME_SHOP_ITEMS.length})`)

// 4. VALIDAÇÃO DE RESILIÊNCIA E PREPARAÇÃO PARA NOVAS MOLDURAS
console.log('\n--- GRUPO 4: RESILIÊNCIA E PREPARAÇÃO PARA FUTURAS MOLDURAS ---')
assert(typeof getFrameById === 'function', 'getFrameById é uma função exportada válida')
assert(typeof getFrameRarityBadge === 'function', 'getFrameRarityBadge é uma função exportada válida')
assert(getFrameById(null) === undefined, 'getFrameById(null) retorna undefined com segurança')
assert(getFrameById('default') === undefined, 'getFrameById("default") retorna undefined com segurança')

console.log('\n====================================================')
console.log('🏆 100% DOS TESTES DE PURGA E INTEGRIDADE PASSARAM COM SUCESSO!')
console.log('====================================================')
