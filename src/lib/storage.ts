import { SlotNumber } from '@/types';

const PREFIX = 'vibe';
const ACTIVE_SLOT_KEY = `${PREFIX}_active_slot`;

export function getActiveSlot(): SlotNumber {
  if (typeof window === 'undefined') return 1;
  const slot = localStorage.getItem(ACTIVE_SLOT_KEY);
  return (slot ? parseInt(slot) : 1) as SlotNumber;
}

export function setActiveSlot(slot: SlotNumber): void {
  localStorage.setItem(ACTIVE_SLOT_KEY, String(slot));
}

function getSlotKey(key: string): string {
  const slot = getActiveSlot();
  return `${PREFIX}_slot_${slot}_${key}`;
}

export function getData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getSlotKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(getSlotKey(key), JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write failed:', e);
  }
}

export function removeData(key: string): void {
  localStorage.removeItem(getSlotKey(key));
}

export function clearSlot(slot: SlotNumber): void {
  const prefix = `${PREFIX}_slot_${slot}_`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function clearAllData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function isSlotEmpty(slot: SlotNumber): boolean {
  const prefix = `${PREFIX}_slot_${slot}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) return false;
  }
  return true;
}

// Storage keys constants
export const STORAGE_KEYS = {
  HACKATHONS: 'hackathons',
  HACKATHON_DETAILS: 'hackathon_details',
  TEAMS: 'teams',
  LEADERBOARD: 'leaderboard',
  USER: 'user',
  PROMPTS: 'prompts',
  MARKET: 'market',
  ARENA_MATCHES: 'arena_matches',
  ARENA_RATINGS: 'arena_ratings',
  INVESTMENTS: 'investments',
  RANKINGS: 'rankings',
  SECTIONS: 'sections',
  TIMELAPSE: 'timelapse',
  DEEP_WORK: 'deep_work',
} as const;
