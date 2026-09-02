const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'src', 'data', 'shopTitles.ts')
let content = fs.readFileSync(filePath, 'utf8')

// Rebalance thematic titles:
// _1 -> 150
// _2 -> 250
// _3 -> 500
// _4 -> 800
// _5 -> 1500
// _6 -> 2500
// _7 -> 4000

content = content.replace(/(id:\s*['"]tit_[a-z]+_1['"][^}]+?price:\s*)\d+/g, '$1150')
content = content.replace(/(id:\s*['"]tit_[a-z]+_2['"][^}]+?price:\s*)\d+/g, '$1250')
content = content.replace(/(id:\s*['"]tit_[a-z]+_3['"][^}]+?price:\s*)\d+/g, '$1500')
content = content.replace(/(id:\s*['"]tit_[a-z]+_4['"][^}]+?price:\s*)\d+/g, '$1800')
content = content.replace(/(id:\s*['"]tit_[a-z]+_5['"][^}]+?price:\s*)\d+/g, '$11500')
content = content.replace(/(id:\s*['"]tit_[a-z]+_6['"][^}]+?price:\s*)\d+/g, '$12500')
content = content.replace(/(id:\s*['"]tit_[a-z]+_7['"][^}]+?price:\s*)\d+/g, '$14000')

// Streaks and progression:
// tit_strk_1 -> 150
// tit_strk_2 -> 500
// tit_strk_3 -> 800
// tit_strk_4 -> 1500
// tit_strk_5 -> 2500
// tit_prec_1 -> 150
// tit_prec_2 -> 500
// tit_prec_3 -> 800
// tit_prec_4 -> 1500
// tit_prec_5 -> 2500
// tit_prec_6 -> 4000
// tit_dist_1 -> 250
// tit_dist_2 -> 500
// tit_dist_3 -> 1500
// tit_dist_4 -> 2500
// tit_dist_5 -> 4000

content = content.replace(/(id:\s*['"]tit_strk_1['"][^}]+?price:\s*)\d+/g, '$1150')
content = content.replace(/(id:\s*['"]tit_strk_2['"][^}]+?price:\s*)\d+/g, '$1500')
content = content.replace(/(id:\s*['"]tit_strk_3['"][^}]+?price:\s*)\d+/g, '$1800')
content = content.replace(/(id:\s*['"]tit_strk_4['"][^}]+?price:\s*)\d+/g, '$11500')
content = content.replace(/(id:\s*['"]tit_strk_5['"][^}]+?price:\s*)\d+/g, '$12500')

content = content.replace(/(id:\s*['"]tit_prec_1['"][^}]+?price:\s*)\d+/g, '$1150')
content = content.replace(/(id:\s*['"]tit_prec_2['"][^}]+?price:\s*)\d+/g, '$1500')
content = content.replace(/(id:\s*['"]tit_prec_3['"][^}]+?price:\s*)\d+/g, '$1800')
content = content.replace(/(id:\s*['"]tit_prec_4['"][^}]+?price:\s*)\d+/g, '$11500')
content = content.replace(/(id:\s*['"]tit_prec_5['"][^}]+?price:\s*)\d+/g, '$12500')
content = content.replace(/(id:\s*['"]tit_prec_6['"][^}]+?price:\s*)\d+/g, '$14000')

content = content.replace(/(id:\s*['"]tit_dist_1['"][^}]+?price:\s*)\d+/g, '$1250')
content = content.replace(/(id:\s*['"]tit_dist_2['"][^}]+?price:\s*)\d+/g, '$1500')
content = content.replace(/(id:\s*['"]tit_dist_3['"][^}]+?price:\s*)\d+/g, '$11500')
content = content.replace(/(id:\s*['"]tit_dist_4['"][^}]+?price:\s*)\d+/g, '$12500')
content = content.replace(/(id:\s*['"]tit_dist_5['"][^}]+?price:\s*)\d+/g, '$14000')

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully rebalanced shopTitles.ts to canonical price tiers!')
