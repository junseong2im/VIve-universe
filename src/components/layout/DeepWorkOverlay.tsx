'use client';

import { useDeepWork } from '@/contexts/DeepWorkContext';

export function DeepWorkOverlay() {
  const { isDeepWork, countdown } = useDeepWork();

  if (!isDeepWork) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 pointer-events-none" id="deep-work-overlay">
      <div className="bg-gradient-to-r from-red-900/30 via-red-800/50 to-red-900/30 border-b border-red-500/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span className="text-red-400 animate-pulse text-lg">!</span>
          <span className="text-red-300 font-mono text-sm font-bold tracking-wider">
            DEEP WORK MODE ACTIVATED
          </span>
          {countdown && (
            <span className="text-red-400 font-mono text-sm bg-red-900/30 px-3 py-1 rounded-lg border border-red-500/20">
              {countdown}
            </span>
          )}
          <span className="text-red-400 animate-pulse text-lg">!</span>
        </div>
      </div>
    </div>
  );
}
