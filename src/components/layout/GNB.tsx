'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDeepWork } from '@/contexts/DeepWorkContext';
import { useUser } from '@/contexts/UserContext';
import { SaveSlots } from './SaveSlots';
import { DeepWorkOverlay } from './DeepWorkOverlay';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/hackathons', label: '해커톤', id: 'nav-hackathons' },
  { href: '/camp', label: '캠프', id: 'nav-camp' },
  { href: '/rankings', label: '랭킹', id: 'nav-rankings' },
  { href: '/market', label: '마켓', id: 'nav-market' },
  { href: '/arena', label: '아레나', id: 'nav-arena' },
];

export function GNB() {
  const pathname = usePathname();
  const { isDeepWork, toggleDeepWork, countdown } = useDeepWork();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <DeepWorkOverlay />
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong" id="gnb"
           style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" id="nav-home">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--grad-nebula)' }}>
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <span className="glitch font-extrabold text-base tracking-tight" data-text="VIBE UNIVERSE">
              <span className="gradient-text">VIBE</span>
              <span style={{ color: 'var(--text-bright)' }} className="ml-1.5 font-bold">UNIVERSE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = pathname.startsWith(item.href);
              const isBlocked = isDeepWork && item.href !== '/hackathons';

              return (
                <Link
                  key={item.href}
                  href={isBlocked ? '#' : item.href}
                  id={item.id}
                  className={`
                    relative px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300
                    ${isActive
                      ? 'text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }
                    ${isBlocked ? 'opacity-20 pointer-events-none' : ''}
                  `}
                  onClick={e => { if (isBlocked) e.preventDefault(); }}
                  style={isActive ? { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' } : {}}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                          style={{ background: 'var(--accent-nebula)' }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Deep Work Toggle */}
            <button
              onClick={toggleDeepWork}
              id="deep-work-toggle"
              className={`
                hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all
                ${isDeepWork
                  ? 'text-red-400 animate-pulse'
                  : 'text-[var(--text-ghost)] hover:text-[var(--text-muted)]'
                }
              `}
              style={isDeepWork
                ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
              }
              title="몰입 모드 토글"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDeepWork ? 'bg-red-500' : 'bg-[var(--text-ghost)]'}`} />
              {isDeepWork ? countdown || 'FOCUS' : 'FOCUS'}
            </button>

            {/* Points */}
            {user && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" id="user-points"
                   style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                <span style={{ color: 'var(--accent-supernova)' }} className="text-xs font-bold">⬡</span>
                <span style={{ color: '#fb923c' }} className="font-mono text-sm font-bold">
                  {user.vibePoints.toLocaleString()}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(249,115,22,0.5)' }}>VP</span>
              </div>
            )}

            <SaveSlots />

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 text-[var(--text-muted)] hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              id="mobile-menu-toggle"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <path d="M6 6l8 8M14 6l-8 8" />
                  : <><path d="M4 6h12" /><path d="M4 10h12" /><path d="M4 14h12" /></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid rgba(124,58,237,0.1)', background: 'rgba(10,10,26,0.97)' }}
               className="md:hidden backdrop-blur-xl">
            <div className="p-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const isActive = pathname.startsWith(item.href);
                const isBlocked = isDeepWork && item.href !== '/hackathons';
                return (
                  <Link
                    key={item.href}
                    href={isBlocked ? '#' : item.href}
                    className={`
                      flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all
                      ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}
                      ${isBlocked ? 'opacity-20' : 'hover:bg-white/[0.03]'}
                    `}
                    style={isActive ? { background: 'rgba(124,58,237,0.12)' } : {}}
                    onClick={e => {
                      if (isBlocked) e.preventDefault();
                      else setMobileOpen(false);
                    }}
                  >
                    {item.label}
                    {isBlocked && <span className="ml-auto text-xs">🔒</span>}
                  </Link>
                );
              })}

              {user && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                     style={{ background: 'rgba(249,115,22,0.06)' }}>
                  <span style={{ color: '#fb923c' }} className="font-mono font-bold">
                    {user.vibePoints.toLocaleString()} VP
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
