'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Leaderboard, User, Investment, ArenaTeamRating } from '@/types';
import { getData, STORAGE_KEYS } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

interface RankEntry {
  rank: number;
  nickname: string;
  vibePoints: number;
  investReturn: number;
  arenaWins: number;
  isMe: boolean;
}

export default function RankingsPage() {
  const { user } = useUser();
  const [rankings, setRankings] = useState<RankEntry[]>([]);

  const loadData = useCallback(() => {
    // Build rankings from multiple sources
    const leaderboards = getData<Leaderboard[]>(STORAGE_KEYS.LEADERBOARD);
    const investments = getData<Investment[]>(STORAGE_KEYS.INVESTMENTS) || [];
    const arenaRatings = getData<ArenaTeamRating[]>(STORAGE_KEYS.ARENA_RATINGS) || [];

    // Generate sample rankings + merge with real user data
    const sampleRanks: RankEntry[] = [
      { rank: 1, nickname: '바이브마스터', vibePoints: 2500, investReturn: 800, arenaWins: 42, isMe: false },
      { rank: 2, nickname: 'AI크래프터', vibePoints: 1800, investReturn: 300, arenaWins: 35, isMe: false },
      { rank: 3, nickname: '프롬프트엔지니어', vibePoints: 1650, investReturn: 450, arenaWins: 28, isMe: false },
      { rank: 4, nickname: '코드위저드', vibePoints: 1400, investReturn: 200, arenaWins: 22, isMe: false },
      { rank: 5, nickname: '디자인허슬러', vibePoints: 1200, investReturn: 100, arenaWins: 31, isMe: false },
      { rank: 6, nickname: '해커톤킹', vibePoints: 1100, investReturn: -50, arenaWins: 18, isMe: false },
      { rank: 8, nickname: '바이브러너', vibePoints: 950, investReturn: 150, arenaWins: 15, isMe: false },
      { rank: 9, nickname: '풀스택마스터', vibePoints: 800, investReturn: 0, arenaWins: 12, isMe: false },
      { rank: 10, nickname: '데이터사이언티스트', vibePoints: 720, investReturn: 80, arenaWins: 10, isMe: false },
    ];

    // My data
    const myInvestReturn = investments.filter(i => i.settled).reduce((s, i) => s + (i.payout - i.amount), 0);
    const myArenaRating = arenaRatings.find(r => r.teamCode === user?.teamCode);
    const myEntry: RankEntry = {
      rank: 0, nickname: user?.nickname || '나', vibePoints: user?.vibePoints || 1000,
      investReturn: myInvestReturn, arenaWins: myArenaRating?.wins || 0, isMe: true,
    };

    // Merge and sort
    const all = [...sampleRanks, myEntry].sort((a, b) => b.vibePoints - a.vibePoints);
    all.forEach((entry, idx) => { entry.rank = idx + 1; });
    setRankings(all);
  }, [user]);

  useEffect(() => {
    loadData();
    window.addEventListener('slot-switched', loadData);
    return () => window.removeEventListener('slot-switched', loadData);
  }, [loadData]);

  const myRank = rankings.find(r => r.isMe);
  const totalPlayers = rankings.length;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#a78bfa' }}>RANKINGS</p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-bright)' }}>글로벌 랭킹</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Vibe Point 총자산 기준 전체 순위</p>
        </motion.div>

        {/* My Stats Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold font-mono" style={{ color: '#fb923c' }}>
                {myRank ? myRank.vibePoints.toLocaleString() : '1,000'}
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-ghost)' }}>내 Vibe Points</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono" style={{ color: 'var(--accent-star)' }}>
                #{myRank?.rank || '?'}
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-ghost)' }}>내 순위 / {totalPlayers}</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono" style={{ color: myRank && myRank.investReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {myRank?.investReturn || 0}
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-ghost)' }}>투자 수익</div>
            </div>
          </div>
        </motion.div>

        {/* Ranking Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_120px_100px_80px] gap-4 px-6 py-3 text-[11px] uppercase tracking-wider font-semibold"
               style={{ color: 'var(--text-ghost)', borderBottom: '1px solid var(--border-dim)' }}>
            <span>순위</span><span>닉네임</span><span className="text-right">VIBE POINTS</span><span className="text-right">투자 수익</span><span className="text-right">아레나</span>
          </div>

          {/* Rows */}
          {rankings.map((entry, idx) => (
            <motion.div key={entry.nickname} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
              className="grid grid-cols-[60px_1fr_120px_100px_80px] gap-4 px-6 py-4 items-center transition-colors"
              style={{
                borderBottom: idx < rankings.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                background: entry.isMe ? 'rgba(124,58,237,0.06)' : 'transparent',
                borderLeft: entry.isMe ? '3px solid var(--accent-nebula)' : '3px solid transparent',
              }}>
              {/* Rank */}
              <div className="font-bold" style={{ color: entry.rank <= 3 ? '#fb923c' : 'var(--text-ghost)' }}>
                {entry.rank <= 3 ? ['1st', '2nd', '3rd'][entry.rank - 1] : entry.rank}
              </div>
              {/* Name */}
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: entry.isMe ? 'var(--accent-star)' : 'var(--text-bright)' }}>
                  {entry.nickname}
                </span>
                {entry.isMe && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>(나)</span>}
              </div>
              {/* VP */}
              <div className="text-right font-mono font-bold" style={{ color: '#fb923c' }}>
                {entry.vibePoints.toLocaleString()}<span className="text-[10px] ml-0.5 font-normal" style={{ color: 'var(--text-ghost)' }}>VP</span>
              </div>
              {/* Invest */}
              <div className="text-right font-mono text-sm" style={{ color: entry.investReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {entry.investReturn > 0 ? '+' : ''}{entry.investReturn}
              </div>
              {/* Arena */}
              <div className="text-right font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{entry.arenaWins}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
