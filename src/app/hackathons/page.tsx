'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hackathon } from '@/types';
import { getData, STORAGE_KEYS } from '@/lib/storage';

const STATUS_MAP: Record<string, { label: string; badge: string; dotColor: string }> = {
  upcoming: { label: '모집중', badge: 'badge-primary', dotColor: '#a78bfa' },
  ongoing: { label: '진행중', badge: 'badge-success', dotColor: '#34d399' },
  ended: { label: '종료', badge: 'badge-danger', dotColor: '#f87171' },
};

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const data = getData<Hackathon[]>(STORAGE_KEYS.HACKATHONS);
    if (data) setHackathons(data);

    const handleSlotSwitch = () => {
      const d = getData<Hackathon[]>(STORAGE_KEYS.HACKATHONS);
      if (d) setHackathons(d);
    };
    window.addEventListener('slot-switched', handleSlotSwitch);
    return () => window.removeEventListener('slot-switched', handleSlotSwitch);
  }, []);

  const filtered = hackathons.filter(h =>
    statusFilter === 'all' || h.status === statusFilter
  );

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
             style={{ color: 'var(--accent-star)' }}>HACKATHONS</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>
            해커톤 목록
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            진행중인 해커톤에 참가하고 바이브 코딩으로 우승을 노리세요
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {['all', 'upcoming', 'ongoing', 'ended'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
              style={
                statusFilter === status
                  ? { background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }
                  : { background: 'transparent', color: 'var(--text-ghost)', border: '1px solid var(--border-dim)' }
              }
            >
              {status === 'all' ? '전체' : STATUS_MAP[status]?.label || status}
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 glass-card p-12">
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
              해당하는 해커톤이 없습니다
            </p>
            <p className="text-sm" style={{ color: 'var(--text-ghost)' }}>
              필터를 변경하거나 새로운 해커톤을 기다려주세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((hackathon, idx) => {
              const statusInfo = STATUS_MAP[hackathon.status] || STATUS_MAP.upcoming;
              return (
                <motion.div
                  key={hackathon.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link
                    href={`/hackathons/${hackathon.slug}`}
                    id={`hackathon-card-${hackathon.slug}`}
                    className="block glass-card p-6 group"
                  >
                    {/* Status + Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: statusInfo.dotColor }} />
                        <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
                      </div>
                      <span className="text-[11px] font-mono" style={{ color: 'var(--text-ghost)' }}>
                        {new Date(hackathon.period.endAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold mb-3 leading-snug transition-colors group-hover:text-[var(--accent-star)]"
                        style={{ color: 'var(--text-bright)' }}>
                      {hackathon.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hackathon.tags.map(tag => (
                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-ghost)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Deadline */}
                    <div className="pt-4" style={{ borderTop: '1px solid var(--border-dim)' }}>
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-ghost)' }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                        </svg>
                        <span>제출 마감: {new Date(hackathon.period.submissionDeadlineAt).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="flex justify-end mt-3">
                      <span className="text-[12px] font-semibold flex items-center gap-1 transition-all group-hover:gap-2"
                            style={{ color: 'var(--text-ghost)' }}>
                        상세보기
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
