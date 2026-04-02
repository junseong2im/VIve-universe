'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { getData, setData, STORAGE_KEYS } from '@/lib/storage';

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
      const updated = { ...current, nickname };
      setData(STORAGE_KEYS.USER, updated);
      setUser(updated);
    }
  }, []);

  const addPoints = useCallback((amount: number) => {
    const current = getData<User>(STORAGE_KEYS.USER);
    if (current) {
      const updated = { ...current, vibePoints: current.vibePoints + amount };
      setData(STORAGE_KEYS.USER, updated);
      setUser(updated);
    }
  }, []);

  const deductPoints = useCallback((amount: number): boolean => {
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
      const updated = { ...current, teamCode };
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
