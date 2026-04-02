'use client';

import { useSlot } from '@/contexts/SlotContext';
import { SlotNumber } from '@/types';
import { useState } from 'react';

export function SaveSlots() {
  const { activeSlot, switchSlot, slotStatus } = useSlot();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (slot: SlotNumber) => {
    if (slot === activeSlot || switching) return;
    setSwitching(true);
    
    document.body.classList.add('slot-switching');
    await new Promise(resolve => setTimeout(resolve, 300));
    switchSlot(slot);
    await new Promise(resolve => setTimeout(resolve, 300));
    document.body.classList.remove('slot-switching');
    setSwitching(false);
  };

  return (
    <div className="flex items-center gap-[3px] p-[3px] rounded-[10px]" id="save-slots"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {([1, 2, 3] as SlotNumber[]).map(slot => (
        <button
          key={slot}
          onClick={() => handleSwitch(slot)}
          disabled={switching}
          id={`save-slot-${slot}`}
          className="relative w-7 h-7 rounded-lg text-[11px] font-mono font-bold transition-all duration-300"
          style={
            activeSlot === slot
              ? { background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.4)' }
              : { background: 'transparent', color: 'var(--text-ghost)', border: '1px solid transparent' }
          }
          title={`세이브 슬롯 ${slot}`}
        >
          {slot}
          {activeSlot === slot && (
            <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full animate-pulse"
                  style={{ background: 'var(--accent-nebula)' }} />
          )}
        </button>
      ))}
    </div>
  );
}
