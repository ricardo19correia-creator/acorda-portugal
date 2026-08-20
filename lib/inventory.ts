import { AVATARS_2050, type AvatarItem } from './avatars';

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
      ownedAvatars: ['camoes_2050'],
      equippedAvatar: 'camoes_2050',
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
        ownedAvatars: ['camoes_2050'],
        equippedAvatar: 'camoes_2050',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    if (!parsed.ownedAvatars || !Array.isArray(parsed.ownedAvatars)) {
      parsed.ownedAvatars = ['camoes_2050'];
    }
    if (!parsed.equippedAvatar) {
      parsed.equippedAvatar = 'camoes_2050';
    }
    return parsed;
  } catch (e) {
    return {
      ownedItems: ['default_tron'],
      equippedTheme: 'default_tron',
      isVip: false,
      ownedAvatars: ['camoes_2050'],
      equippedAvatar: 'camoes_2050',
    };
  }
};

export const saveInventory = (state: InventoryState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('ap_user_inventory', JSON.stringify(state.ownedItems));
    localStorage.setItem(
      'ap_equipped_items',
      JSON.stringify({ theme: state.equippedTheme, avatar: state.equippedAvatar })
    );
    if (state.equippedAvatar) {
      const av = AVATARS_2050.find(a => a.id === state.equippedAvatar);
      if (av?.image) {
        localStorage.setItem('user_equipped_avatar', av.image);
        localStorage.setItem('user_equipped_avatar_id', av.id);
        localStorage.setItem('user_equipped_avatar_glow', av.glowColor || '');
      }
    }
    window.dispatchEvent(new Event('avatarChanged'));
    window.dispatchEvent(new Event('inventory_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
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
    current.ownedAvatars = ['camoes_2050'];
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
    current.ownedAvatars = ['camoes_2050'];
  }
  if (!current.ownedAvatars.includes(avatarId)) {
    current.ownedAvatars.push(avatarId);
  }
  current.equippedAvatar = avatarId;

  if (typeof window !== 'undefined') {
    const av = AVATARS_2050.find(a => a.id === avatarId);
    if (av?.image) {
      try {
        localStorage.setItem('user_equipped_avatar', av.image);
        localStorage.setItem('user_equipped_avatar_id', av.id);
        localStorage.setItem('user_equipped_avatar_glow', av.glowColor || '');
      } catch {}
    }
  }

  saveInventory(current);
};

export const getEquippedAvatarImage = (): string => {
  if (typeof window === 'undefined') return '/images/avatars/camoes-2050.jpg';
  try {
    const direct = localStorage.getItem('user_equipped_avatar');
    if (direct) return direct;
    const inv = getInventory();
    const found = AVATARS_2050.find(a => a.id === inv.equippedAvatar);
    if (found?.image) return found.image;
  } catch {}
  return '/images/avatars/camoes-2050.jpg';
};

export const getEquippedAvatarItem = (): AvatarItem => {
  const inv = getInventory();
  return AVATARS_2050.find(a => a.id === inv.equippedAvatar) || AVATARS_2050[0];
};
