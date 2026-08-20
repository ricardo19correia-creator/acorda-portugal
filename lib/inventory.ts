export interface InventoryState {
  ownedItems: string[];
  equippedTheme: string;
  isVip: boolean;
  vipTitle?: string;
  ownedAvatars?: string[];
  equippedAvatar?: string;
}

const STORAGE_KEY = 'ap_user_inventory_v3';

export const getInventory = (): InventoryState => {
  if (typeof window === 'undefined') {
    return {
      ownedItems: ['default_tron'],
      equippedTheme: 'default_tron',
      isVip: false,
      ownedAvatars: ['av_default', 'av_galo_barcelos'],
      equippedAvatar: 'av_default',
    };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Migração de chaves antigas se existirem
      let legacyOwned = ['default_tron'];
      try {
        const oldInv = localStorage.getItem('ap_user_inventory');
        if (oldInv) {
          const parsed = JSON.parse(oldInv);
          if (Array.isArray(parsed)) {
            legacyOwned = Array.from(new Set(['default_tron', ...parsed]));
          }
        }
      } catch {}

      let legacyTheme = 'default_tron';
      try {
        const oldEquipped = localStorage.getItem('ap_equipped_items');
        if (oldEquipped) {
          const parsed = JSON.parse(oldEquipped);
          if (parsed.theme) legacyTheme = parsed.theme;
        }
      } catch {}

      const initial: InventoryState = {
        ownedItems: legacyOwned,
        equippedTheme: legacyTheme,
        isVip: legacyOwned.includes('vip_founder_pass'),
        vipTitle: legacyOwned.includes('vip_founder_pass') ? 'Fundador da Nação' : undefined,
        ownedAvatars: ['av_default', 'av_galo_barcelos'],
        equippedAvatar: 'av_default',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    if (!parsed.ownedAvatars || !Array.isArray(parsed.ownedAvatars)) {
      parsed.ownedAvatars = ['av_default', 'av_galo_barcelos'];
    }
    if (!parsed.equippedAvatar) {
      parsed.equippedAvatar = 'av_default';
    }
    return parsed;
  } catch (e) {
    return {
      ownedItems: ['default_tron'],
      equippedTheme: 'default_tron',
      isVip: false,
      ownedAvatars: ['av_default', 'av_galo_barcelos'],
      equippedAvatar: 'av_default',
    };
  }
};

export const saveInventory = (state: InventoryState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Manter compatibilidade com chaves legadas
  try {
    localStorage.setItem('ap_user_inventory', JSON.stringify(state.ownedItems));
    localStorage.setItem(
      'ap_equipped_items',
      JSON.stringify({ theme: state.equippedTheme, avatar: state.equippedAvatar })
    );
  } catch {}
  window.dispatchEvent(new Event('inventory_updated'));
};

export const unlockItem = (itemId: string, isVipPass: boolean = false) => {
  const current = getInventory();
  if (!current.ownedItems.includes(itemId)) {
    current.ownedItems.push(itemId);
  }
  if (isVipPass || itemId === 'vip_founder_pass') {
    current.isVip = true;
    current.vipTitle = 'Fundador da Nação';
    if (!current.ownedItems.includes('theme_arena_gold_temple')) {
      current.ownedItems.push('theme_arena_gold_temple');
    }
  }
  saveInventory(current);
};

export const unlockAvatar = (avatarId: string) => {
  const current = getInventory();
  if (!current.ownedAvatars) {
    current.ownedAvatars = ['av_default', 'av_galo_barcelos'];
  }
  if (!current.ownedAvatars.includes(avatarId)) {
    current.ownedAvatars.push(avatarId);
  }
  saveInventory(current);
};

export const equipTheme = (themeId: string) => {
  const current = getInventory();
  current.equippedTheme = themeId;
  saveInventory(current);
};

export const equipAvatar = (avatarId: string) => {
  const current = getInventory();
  if (!current.ownedAvatars) {
    current.ownedAvatars = ['av_default', 'av_galo_barcelos'];
  }
  if (!current.ownedAvatars.includes(avatarId)) {
    current.ownedAvatars.push(avatarId);
  }
  current.equippedAvatar = avatarId;
  saveInventory(current);
};
