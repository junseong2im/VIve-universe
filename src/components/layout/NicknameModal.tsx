'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export function NicknameModal() {
  const { user, setNickname } = useUser();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [phase, setPhase] = useState(0); // 0: hidden, 1: entering

  useEffect(() => {
    if (user && !user.nickname) {
      setTimeout(() => { setShow(true); setPhase(1); }, 500);
    }
  }, [user]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setNickname(name.trim());
    setPhase(0);
    setTimeout(() => setShow(false), 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
         style={{
           background: 'rgba(5, 5, 16, 0.85)',
           backdropFilter: 'blur(16px)',
           opacity: phase === 1 ? 1 : 0,
           transition: 'opacity 0.4s ease',
         }}>
      <div className="max-w-md w-full mx-4"
           style={{
             transform: phase === 1 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
             opacity: phase === 1 ? 1 : 0,
             transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
           }}>

        {/* Top decorative line */}
        <div className="h-[2px] w-full rounded-full mb-6 mx-auto max-w-[200px]"
             style={{ background: 'var(--grad-nebula)' }} />

        <div className="glass-card p-8" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.1))', border: '1px solid var(--border-dim)' }}>
            <span className="text-3xl">🚀</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-bright)' }}>
            시스템 접속
          </h2>
          <p className="text-center text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            도망간 개발자의 시스템을 복원할<br/>
            당신의 닉네임을 입력하세요.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="input-field text-center text-lg font-medium"
                autoFocus
                maxLength={20}
                style={{ padding: '1rem' }}
              />
              {name.length > 0 && name.trim().length < 2 && (
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-danger)' }}>
                  최소 2자 이상 입력해주세요
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
              style={{ padding: '0.875rem', fontSize: '0.9375rem' }}
            >
              입장하기 →
            </button>
          </form>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-ghost)' }}>
          로컬 저장소에 저장됩니다 · 3개 슬롯 지원
        </p>
      </div>
    </div>
  );
}
