'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SlotNumber } from '@/types';
import { getActiveSlot, setActiveSlot as saveActiveSlot, isSlotEmpty } from '@/lib/storage';

interface SlotContextType {
  activeSlot: SlotNumber;
  switchSlot: (slot: SlotNumber) => void;
  slotStatus: Record<SlotNumber, boolean>;
  refreshSlotStatus: () => void;
}

const SlotContext = createContext<SlotContextType>({
  activeSlot: 1,
  switchSlot: () => {},
  slotStatus: { 1: false, 2: true, 3: true },
  refreshSlotStatus: () => {},
});

export function SlotProvider({ children }: { children: React.ReactNode }) {
  const [activeSlot, setActiveSlotState] = useState<SlotNumber>(1);
  const [slotStatus, setSlotStatus] = useState<Record<SlotNumber, boolean>>({ 1: false, 2: true, 3: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveSlotState(getActiveSlot());
    refreshSlotStatus();
  }, []);

  const refreshSlotStatus = useCallback(() => {
    setSlotStatus({
      1: isSlotEmpty(1),
      2: isSlotEmpty(2),
      3: isSlotEmpty(3),
    });
  }, []);

  const switchSlot = useCallback((slot: SlotNumber) => {
    saveActiveSlot(slot);
    setActiveSlotState(slot);
    refreshSlotStatus();
    // Force a re-render of the entire app by dispatching a custom event
    window.dispatchEvent(new CustomEvent('slot-switched', { detail: { slot } }));
  }, [refreshSlotStatus]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SlotContext.Provider value={{ activeSlot, switchSlot, slotStatus, refreshSlotStatus }}>
      {children}
    </SlotContext.Provider>
  );
}

export function useSlot() {
  return useContext(SlotContext);
}
