const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'src', 'data', 'shopArenas.ts')
let content = fs.readFileSync(filePath, 'utf8')

const ARENA_PRICES = {
  "arena_praca_liberdade": 0,
  "arena_cidade_norte": 2000,
  "arena_costa_selvagem": 2500,
  "arena_mosteiro_antigo": 2200,
  "arena_festival_portugues": 2800,
  "arena_costa_atlantica": 3500,
  "arena_ponte_d_luis": 4000,
  "arena_madeira_tropical": 4200,
  "arena_castelo_obidos": 4500,
  "arena_madeira_noite": 4500,
  "arena_fado_alfama": 4800,
  "arena_torre_belem": 5000,
  "arena_lisboa_imperial_noturna": 7500,
  "arena_ponte_douro_panoramica": 8000,
  "arena_lisboa_imperial": 8500,
  "arena_portugal_medieval": 8500,
  "arena_vulcao_erupcao": 9000,
  "arena_vulcao_furnas": 9500,
  "arena_batalha_medieval": 10000,
  "arena_caos_patos": 10500,
  "arena_teatro_nacional": 11000,
  "arena_estadio_nacional": 13500,
  "arena_pico_estrelas": 14000,
  "arena_pico_aurora": 15000,
  "arena_noite_jogo": 15500,
  "arena_era_descobrimentos": 16000,
  "arena_corte_portuguesa": 17500,
  "arena_final_nacional": 18000,
  "arena_noite_selecao": 20000,
  "arena_duelo_1v1_oficial": 22500,
  "arena_ponte_2077": 26000,
  "arena_cyber_laboratorio": 28000,
  "arena_portugal_ao_contrario": 29000,
  "arena_lisboa_cybercore": 30000,
  "arena_dimensao_psicadelica": 30000,
  "arena_estacao_orbital": 32000,
  "arena_labirinto_onirico": 33000,
  "arena_dentro_cerebro": 34000,
  "arena_megalopolis_lusa": 35000,
  "arena_portal_galactico": 38000,
  "arena_excl_campeao": null,
  "arena_excl_fundadores": null,
  "arena_excl_lenda_100": null
}

for (const [id, price] of Object.entries(ARENA_PRICES)) {
  // Regex to match the block with this id and replace price
  // e.g. "id": "arena_costa_atlantica", ... "price": \d+
  const regex = new RegExp(`("id":\\s*"${id}"[\\s\\S]*?"price":\\s*)(?:null|\\d+)`, 'g')
  content = content.replace(regex, `$1${price === null ? 'null' : price}`)
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully updated shopArenas.ts with canonical rebalanced prices!')
