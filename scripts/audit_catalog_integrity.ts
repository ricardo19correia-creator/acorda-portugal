import { getShopCatalogItem, isItemPurchasableWithCoins, AID_SHOP_ITEMS } from '../lib/shop-catalog'
import { avatarShopList } from '../data/shopAvatars'
import { TITLE_SHOP_CATALOG } from '../data/shopTitles'
import { shopArenas } from '../data/shopArenas'
import { ANIMATED_FRAMES } from '../data/frames'
import { OFFICIAL_EMOTES } from '../src/data/emotes'

async function auditCatalog() {
  console.log('=== AUDITING CATALOG INTEGRITY ===')
  let missingCount = 0
  let totalCount = 0

  // 1. Ajudas
  for (const aid of AID_SHOP_ITEMS) {
    totalCount++
    const found = getShopCatalogItem(aid.id)
    if (!found || !found.active) {
      console.log(`❌ AID missing/inactive in SSOT catalog: ${aid.id} (${aid.name})`)
      missingCount++
    } else {
      console.log(`✅ AID OK: ${aid.id} -> ${found.name}, Price: ${found.priceCoins}`)
    }
  }

  // 2. Avatares
  for (const av of avatarShopList) {
    totalCount++
    const found = getShopCatalogItem(av.id)
    if (!found || !found.active) {
      console.log(`❌ Avatar missing/inactive in SSOT catalog: ${av.id} (${av.name})`)
      missingCount++
    }
  }

  // 3. Molduras
  for (const frame of ANIMATED_FRAMES) {
    totalCount++
    const found = getShopCatalogItem(frame.id)
    if (!found || !found.active) {
      console.log(`❌ Frame missing/inactive in SSOT catalog: ${frame.id} (${frame.name})`)
      missingCount++
    }
  }

  // 4. Arenas
  for (const arena of shopArenas) {
    totalCount++
    const found = getShopCatalogItem(arena.id)
    if (!found || !found.active) {
      console.log(`❌ Arena missing/inactive in SSOT catalog: ${arena.id} (${arena.name})`)
      missingCount++
    }
  }

  // 5. Títulos
  for (const title of TITLE_SHOP_CATALOG) {
    totalCount++
    const found = getShopCatalogItem(title.id)
    if (!found || !found.active) {
      console.log(`❌ Title missing/inactive in SSOT catalog: ${title.id} (${title.name})`)
      missingCount++
    }
  }

  // 6. Emotes/Taunts
  for (const emote of OFFICIAL_EMOTES) {
    totalCount++
    const found = getShopCatalogItem(emote.id)
    if (!found || !found.active) {
      console.log(`❌ Emote missing/inactive in SSOT catalog: ${emote.id} (${emote.text})`)
      missingCount++
    }
  }

  console.log(`Total items checked: ${totalCount}`)
  console.log(`Missing/Inactive count: ${missingCount}`)
  if (missingCount === 0) {
    console.log('🎉 ALL SHOP ITEMS EXIST AND ARE ACTIVE IN SSOT CATALOG!')
  }
}

auditCatalog().catch(console.error)
