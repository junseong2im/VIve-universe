'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getData, STORAGE_KEYS } from '@/lib/storage';
import { HackathonDetail, Milestone } from '@/types';

interface DeepWorkContextType {
  isDeepWork: boolean;
  toggleDeepWork: () => void;
  countdown: string;
  targetDeadline: string | null;
}

const DeepWorkContext = createContext<DeepWorkContextType>({
  isDeepWork: false,
  toggleDeepWork: () => {},
  countdown: '',
  targetDeadline: null,
});

function getClosestDeadline(): string | null {
  if (typeof window === 'undefined') return null;
  const details = getData<HackathonDetail[]>(STORAGE_KEYS.HACKATHON_DETAILS);
  if (!details) return null;

  const now = Date.now();
  let closest: string | null = null;
  let closestDiff = Infinity;

  details.forEach(detail => {
    if (detail.sections?.schedule?.milestones) {
      detail.sections.schedule.milestones.forEach((m: Milestone) => {
        const dt = new Date(m.at).getTime();
        const diff = dt - now;
        if (diff > 0 && diff < closestDiff) {
          closest = m.at;
          closestDiff = diff;
        }
      });
    }
  });

  return closest;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function DeepWorkProvider({ children }: { children: React.ReactNode }) {
  const [isDeepWork, setIsDeepWork] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [targetDeadline, setTargetDeadline] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkDeepWork = useCallback(() => {
    const deadline = getClosestDeadline();
    if (!deadline) return;
    
    setTargetDeadline(deadline);
    const dt = new Date(deadline).getTime();
    const now = Date.now();
    const diff = dt - now;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (diff > 0 && diff <= twentyFourHours) {
      setIsDeepWork(true);
      setCountdown(formatCountdown(diff));
    }
  }, []);

  useEffect(() => {
    checkDeepWork();
    intervalRef.current = setInterval(() => {
      if (targetDeadline) {
        const diff = new Date(targetDeadline).getTime() - Date.now();
        if (diff > 0) {
          setCountdown(formatCountdown(diff));
        } else {
          setCountdown('00:00:00');
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkDeepWork, targetDeadline]);

  const toggleDeepWork = useCallback(() => {
    setManualToggle(prev => !prev);
    setIsDeepWork(prev => !prev);
  }, []);

  return (
    <DeepWorkContext.Provider value={{ isDeepWork: isDeepWork || manualToggle, toggleDeepWork, countdown, targetDeadline }}>
      {children}
    </DeepWorkContext.Provider>
  );
}

export function useDeepWork() {
  return useContext(DeepWorkContext);
}
