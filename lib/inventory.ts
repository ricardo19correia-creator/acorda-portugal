import {
  REAL_AVATARS,
  type AvatarItem,
  getAvatarById,
  getAvatarImage,
  normalizeAvatarId,
  DEFAULT_AVATAR,
  STARTER_AVATAR_ID,
} from './avatars';

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
      ownedAvatars: [STARTER_AVATAR_ID],
      equippedAvatar: STARTER_AVATAR_ID,
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

      const legacyAvatar = localStorage.getItem('user_equipped_avatar') || localStorage.getItem('equipped_avatar_id');
      const normalizedEquippedAvatar = normalizeAvatarId(legacyAvatar);

      const initial: InventoryState = {
        ownedItems: legacyOwned,
        equippedTheme: legacyTheme,
        isVip: legacyOwned.includes('vip_founder_pass'),
        vipTitle: legacyOwned.includes('vip_founder_pass') ? 'Fundador da Nação' : undefined,
        ownedAvatars: [normalizedEquippedAvatar || STARTER_AVATAR_ID],
        equippedAvatar: normalizedEquippedAvatar || STARTER_AVATAR_ID,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed.ownedAvatars) || parsed.ownedAvatars.length === 0) {
      parsed.ownedAvatars = [STARTER_AVATAR_ID];
    }
    parsed.equippedAvatar = normalizeAvatarId(parsed.equippedAvatar);
    return parsed;
  } catch (e) {
    return {
      ownedItems: ['default_tron'],
      equippedTheme: 'default_tron',
      isVip: false,
      ownedAvatars: [STARTER_AVATAR_ID],
      equippedAvatar: STARTER_AVATAR_ID,
    };
  }
};

export const saveInventory = (state: InventoryState) => {
  if (typeof window === 'undefined') return;
  try {
    state.equippedAvatar = normalizeAvatarId(state.equippedAvatar);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('ap_user_inventory', JSON.stringify(state.ownedItems));
    localStorage.setItem(
      'ap_equipped_items',
      JSON.stringify({ theme: state.equippedTheme, avatar: state.equippedAvatar })
    );
    
    const av = getAvatarById(state.equippedAvatar);
    localStorage.setItem('user_equipped_avatar', av.image);
    localStorage.setItem('user_equipped_avatar_id', av.id);
    localStorage.setItem('equipped_avatar_id', av.id);
    localStorage.setItem('user_equipped_avatar_glow', av.glowColor || '');

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
  const normalizedId = normalizeAvatarId(avatarId);
  if (!current.ownedAvatars) current.ownedAvatars = [DEFAULT_AVATAR.id];
  if (!current.ownedAvatars.includes(normalizedId)) {
    current.ownedAvatars.push(normalizedId);
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
  const normalizedId = normalizeAvatarId(avatarId);
  current.equippedAvatar = normalizedId;

  if (typeof window !== 'undefined') {
    const av = getAvatarById(normalizedId);
    try {
      localStorage.setItem('user_equipped_avatar', av.image);
      localStorage.setItem('user_equipped_avatar_id', av.id);
      localStorage.setItem('equipped_avatar_id', av.id);
      localStorage.setItem('user_equipped_avatar_glow', av.glowColor || '');
    } catch {}
  }

  saveInventory(current);
};

export const getEquippedAvatarImage = (): string => {
  if (typeof window === 'undefined') return DEFAULT_AVATAR.image;
  try {
    const direct = localStorage.getItem('user_equipped_avatar') || localStorage.getItem('equipped_avatar_id');
    if (direct) return getAvatarImage(direct);
    const inv = getInventory();
    return getAvatarImage(inv.equippedAvatar);
  } catch {}
  return DEFAULT_AVATAR.image;
};

export const getEquippedAvatarItem = (): AvatarItem => {
  const inv = getInventory();
  return getAvatarById(inv.equippedAvatar);
};

