'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getData, STORAGE_KEYS } from '@/lib/storage';
import { Hackathon } from '@/types';
import { useUser } from '@/contexts/UserContext';

const FEATURES = [
  {
    href: '/hackathons',
    title: '해커톤',
    desc: '진행중인 대회에 참가하고 바이브 코딩으로 시스템을 복원하세요',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.06))',
    borderColor: 'rgba(124,58,237,0.2)',
    iconBg: 'rgba(124,58,237,0.15)',
    iconColor: '#a78bfa',
  },
  {
    href: '/camp',
    title: '캠프',
    desc: '팀원을 모집하고 프롬프트 워크스페이스에서 협업을 시작하세요',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.06))',
    borderColor: 'rgba(6,182,212,0.2)',
    iconBg: 'rgba(6,182,212,0.15)',
    iconColor: '#22d3ee',
  },
  {
    href: '/rankings',
    title: '랭킹',
    desc: 'Vibe Point 자산 순위와 투자 수익률을 확인하세요',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M8 21V16M12 21V10M16 21V4M4 21h16" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(245,158,11,0.06))',
    borderColor: 'rgba(249,115,22,0.2)',
    iconBg: 'rgba(249,115,22,0.15)',
    iconColor: '#fb923c',
  },
  {
    href: '/market',
    title: '마켓',
    desc: '검증된 프롬프트와 컴포넌트를 Vibe Point로 거래하세요',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(168,85,247,0.06))',
    borderColor: 'rgba(236,72,153,0.2)',
    iconBg: 'rgba(236,72,153,0.15)',
    iconColor: '#f472b6',
  },
  {
    href: '/arena',
    title: '아레나',
    desc: '1v1 블라인드 투표로 팀을 평가하고 Elo 레이팅에 도전하세요',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.06))',
    borderColor: 'rgba(239,68,68,0.2)',
    iconBg: 'rgba(239,68,68,0.15)',
    iconColor: '#f87171',
  },
];

export default function HomePage() {
  const { user } = useUser();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const h = getData<Hackathon[]>(STORAGE_KEYS.HACKATHONS);
    if (h) setHackathons(h);
  }, []);

  const ongoingCount = hackathons.filter(h => h.status === 'ongoing').length;
  const upcomingCount = hackathons.filter(h => h.status === 'upcoming').length;

  return (
    <div className="min-h-screen relative">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]"
             style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
             style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.25), transparent 70%)' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[13px] font-medium"
            style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: 'var(--accent-star)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {ongoingCount > 0 ? `${ongoingCount}개 대회 진행중` : '새로운 대회 준비중'}
            {upcomingCount > 0 && <span style={{ color: 'var(--text-ghost)' }}>·</span>}
            {upcomingCount > 0 && <span style={{ color: 'var(--text-muted)' }}>{upcomingCount}개 모집중</span>}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]"
          >
            <span style={{ color: 'var(--text-bright)' }}>도망간 개발자의 시스템을</span>
            <br />
            <span className="gradient-text">바이브 코딩</span>
            <span style={{ color: 'var(--text-bright)' }}>으로 복원하라</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            미완성된 명세서를 디지털 UI로 복원하고, 프롬프트를 거래하며,
            <br className="hidden sm:block" />
            팀 간 예측 투자로 새로운 해커톤 경험을 시작하세요.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/hackathons" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '0.9375rem' }}>
              해커톤 시작하기 →
            </Link>
            <Link href="/camp" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '0.9375rem' }}>
              팀 찾기
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto glass-card p-1"
        >
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--border-dim)' }}>
            {[
              { value: hackathons.length, label: '등록된 해커톤', suffix: '개' },
              { value: mounted && user ? user.vibePoints.toLocaleString() : '—', label: '내 Vibe Points', suffix: ' VP' },
              { value: '∞', label: '프롬프트 거래', suffix: '' },
            ].map((stat, i) => (
              <div key={i} className="py-5 px-4 text-center" style={{ borderColor: 'var(--border-dim)' }}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-bright)' }}>
                  {stat.value}<span className="text-sm font-normal" style={{ color: 'var(--text-ghost)' }}>{stat.suffix}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
               style={{ color: 'var(--accent-star)' }}>
              PLATFORM FEATURES
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-bright)' }}>
              AI 해커톤의 모든 도구가 준비되어 있습니다
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((item, idx) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.08, duration: 0.5 }}
              >
                <Link
                  href={item.href}
                  id={`main-menu-${item.href.slice(1)}`}
                  className="block p-6 rounded-2xl transition-all duration-400 group"
                  style={{
                    background: item.gradient,
                    border: `1px solid ${item.borderColor}`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${item.borderColor}`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                  }}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                       style={{ background: item.iconBg, color: item.iconColor }}>
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 transition-colors"
                      style={{ color: 'var(--text-bright)' }}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>

                  {/* Link indicator */}
                  <span className="text-xs font-semibold flex items-center gap-1 transition-all group-hover:gap-2"
                        style={{ color: item.iconColor }}>
                    자세히 보기
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORLDVIEW BANNER ===== */}
      <section className="px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="max-w-4xl mx-auto rounded-2xl p-8 sm:p-12 relative overflow-hidden"
          style={{ background: 'var(--grad-cosmic)' }}
        >
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                준비되셨나요?
              </h3>
              <p className="text-white/70 text-sm sm:text-base">
                지금 바로 미완성 시스템의 복원을 시작하세요.
              </p>
            </div>
            <Link
              href="/hackathons"
              className="flex-shrink-0 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'white', color: 'var(--accent-nebula)' }}
            >
              시작하기 →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-4 py-12" style={{ borderTop: '1px solid var(--border-dim)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
                 style={{ background: 'var(--grad-nebula)' }}>
              <span className="text-white text-[10px] font-bold">V</span>
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
              VIBE UNIVERSE
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
            © 2026 VIBE UNIVERSE — 퀘스트형 AI 해커톤 플랫폼
          </p>
        </div>
      </footer>
    </div>
  );
}
