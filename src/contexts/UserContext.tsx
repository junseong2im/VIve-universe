'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { getData, setData, STORAGE_KEYS } from '@/lib/storage';

const MAX_VP = 999999;
const MAX_SINGLE_TRANSACTION = 1000;

function sanitizeString(str: string): string {
  return str.replace(/[<>"'&]/g, '').trim();
}

interface UserContextType {
  user: User | null;
  setNickname: (nickname: string) => void;
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
  joinTeam: (teamCode: string) => void;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setNickname: () => {},
  addPoints: () => {},
  deductPoints: () => false,
  joinTeam: () => {},
  refreshUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  const refreshUser = useCallback(() => {
    const u = getData<User>(STORAGE_KEYS.USER);
    if (u) {
      // Integrity check: clamp VP to valid range
      if (typeof u.vibePoints !== 'number' || isNaN(u.vibePoints)) u.vibePoints = 1000;
      u.vibePoints = Math.max(0, Math.min(MAX_VP, Math.floor(u.vibePoints)));
    }
    setUser(u);
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshUser();

    const handleSlotSwitch = () => refreshUser();
    window.addEventListener('slot-switched', handleSlotSwitch);
    return () => window.removeEventListener('slot-switched', handleSlotSwitch);
  }, [refreshUser]);

  const setNickname = useCallback((nickname: string) => {
    const current = getData<User>(STORAGE_KEYS.USER);
    if (current) {
      // Sanitize and limit length
      const clean = sanitizeString(nickname).slice(0, 20);
      if (clean.length < 2) return;
      const updated = { ...current, nickname: clean };
      setData(STORAGE_KEYS.USER, updated);
      setUser(updated);
    }
  }, []);

  const addPoints = useCallback((amount: number) => {
    // Validate: must be positive integer, capped per transaction
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_SINGLE_TRANSACTION) return;
    amount = Math.floor(amount);

    const current = getData<User>(STORAGE_KEYS.USER);
    if (current) {
      const newBalance = Math.min(MAX_VP, current.vibePoints + amount);
      const updated = { ...current, vibePoints: newBalance };
      setData(STORAGE_KEYS.USER, updated);
      setUser(updated);
    }
  }, []);

  const deductPoints = useCallback((amount: number): boolean => {
    // Validate: must be positive integer
    if (!Number.isFinite(amount) || amount <= 0) return false;
    amount = Math.floor(amount);

    const current = getData<User>(STORAGE_KEYS.USER);
    if (!current || current.vibePoints < amount) return false;
    const updated = { ...current, vibePoints: current.vibePoints - amount };
    setData(STORAGE_KEYS.USER, updated);
    setUser(updated);
    return true;
  }, []);

  const joinTeam = useCallback((teamCode: string) => {
    const current = getData<User>(STORAGE_KEYS.USER);
    if (current) {
      const clean = sanitizeString(teamCode).slice(0, 30);
      const updated = { ...current, teamCode: clean };
      setData(STORAGE_KEYS.USER, updated);
      setUser(updated);
    }
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <UserContext.Provider value={{ user, setNickname, addPoints, deductPoints, joinTeam, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
