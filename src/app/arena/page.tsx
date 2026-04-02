'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArenaTeamRating, ArenaMatch } from '@/types';
import { getData, setData, STORAGE_KEYS } from '@/lib/storage';
import { updateElo } from '@/lib/elo';
import { useUser } from '@/contexts/UserContext';

const VP_PER_VOTE = 5;

export default function ArenaPage() {
  const { user, addPoints } = useUser();
  const [ratings, setRatings] = useState<ArenaTeamRating[]>([]);
  const [matchA, setMatchA] = useState<ArenaTeamRating | null>(null);
  const [matchB, setMatchB] = useState<ArenaTeamRating | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [roundCount, setRoundCount] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [eloChange, setEloChange] = useState<{ winner: number; loser: number } | null>(null);
  const [voteCooldown, setVoteCooldown] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(() => {
    const r = getData<ArenaTeamRating[]>(STORAGE_KEYS.ARENA_RATINGS);
    if (r && r.length > 0) setRatings(r);
    const m = getData<ArenaMatch[]>(STORAGE_KEYS.ARENA_MATCHES);
    if (m) { setTotalVotes(m.length); setRoundCount(m.length); }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('slot-switched', loadData);
    return () => window.removeEventListener('slot-switched', loadData);
  }, [loadData]);

  const generateMatch = useCallback(() => {
    if (ratings.length < 2) return;
    // Pick two random teams, exclude user's own team for fair blind voting
    let pool = [...ratings];
    if (user?.teamCode) pool = pool.filter(t => t.teamCode !== user.teamCode);
    if (pool.length < 2) pool = [...ratings]; // fallback if not enough
    const shuffled = pool.sort(() => Math.random() - 0.5);
    setMatchA(shuffled[0]);
    setMatchB(shuffled[1]);
    setVoted(null);
    setEloChange(null);
  }, [ratings, user?.teamCode]);

  useEffect(() => {
    if (ratings.length >= 2 && !matchA) generateMatch();
  }, [ratings, matchA, generateMatch]);

  const handleVote = (winner: ArenaTeamRating, loser: ArenaTeamRating) => {
    if (voted || voteCooldown) return;

    // Block voting on own team
    if (user?.teamCode && (winner.teamCode === user.teamCode || loser.teamCode === user.teamCode)) {
      showToast('자기 팀이 포함된 매치에는 투표할 수 없습니다');
      return;
    }

    setVoted(winner.teamCode);
    setVoteCooldown(true);
    setTimeout(() => setVoteCooldown(false), 3000);

    // Calculate Elo
    const { newWinnerRating, newLoserRating } = updateElo(winner.elo, loser.elo);
    const winnerDelta = newWinnerRating - winner.elo;
    const loserDelta = newLoserRating - loser.elo;
    setEloChange({ winner: winnerDelta, loser: loserDelta });

    // Update ratings
    const r = getData<ArenaTeamRating[]>(STORAGE_KEYS.ARENA_RATINGS) || [];
    const wIdx = r.findIndex(x => x.teamCode === winner.teamCode);
    const lIdx = r.findIndex(x => x.teamCode === loser.teamCode);
    if (wIdx !== -1) { r[wIdx].elo = newWinnerRating; r[wIdx].wins++; }
    if (lIdx !== -1) { r[lIdx].elo = newLoserRating; r[lIdx].losses++; }
    setData(STORAGE_KEYS.ARENA_RATINGS, r);

    // Save match
    const matches = getData<ArenaMatch[]>(STORAGE_KEYS.ARENA_MATCHES) || [];
    matches.push({
      id: `arena_${Date.now()}`, teamACode: matchA!.teamCode, teamBCode: matchB!.teamCode,
      teamAName: matchA!.teamName, teamBName: matchB!.teamName, teamADescription: '', teamBDescription: '',
      winner: winner.teamCode, voterId: user?.id || null, createdAt: new Date().toISOString(),
    });
    setData(STORAGE_KEYS.ARENA_MATCHES, matches);

    // VP reward
    addPoints(VP_PER_VOTE);
    showToast(`투표 완료! +${VP_PER_VOTE}VP (${winner.teamName === matchA!.teamName ? 'A' : 'B'}팀 승리, Elo +${winnerDelta})`);

    setRoundCount(matches.length);
    setTotalVotes(matches.length);
    setRatings(r);

    // Next match after delay
    setTimeout(() => generateMatch(), 2500);
  };

  const sortedRatings = [...ratings].sort((a, b) => b.elo - a.elo);

  return (
    <div className="min-h-screen py-10 px-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl"
            style={{ background: 'rgba(16,185,129,0.9)', color: 'white' }}>{toast}</motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#f87171' }}>ARENA</p>
              <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-bright)' }}>바이브 아레나</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>블라인드 1v1 매치 — 투표할 때마다 +{VP_PER_VOTE}VP</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <div className="text-xl font-bold gradient-text">{roundCount}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>총 투표</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold" style={{ color: '#fb923c' }}>{roundCount * VP_PER_VOTE}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>획득 VP</div>
              </div>
              <button onClick={() => setShowLeaderboard(!showLeaderboard)} className={showLeaderboard ? 'btn-ghost text-xs' : 'btn-secondary text-xs'}>
                {showLeaderboard ? '← 배틀' : 'Elo 랭킹'}
              </button>
            </div>
          </div>
        </motion.div>

        {showLeaderboard ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-bold mb-5" style={{ color: 'var(--text-bright)' }}>Elo 레이팅 순위</h3>
            <div className="space-y-2">
              {sortedRatings.map((team, idx) => {
                const total = team.wins + team.losses;
                const winRate = total > 0 ? Math.round((team.wins / total) * 100) : 0;
                return (
                  <div key={team.teamCode} className="flex items-center gap-4 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                         style={{ background: idx < 3 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)', color: idx < 3 ? '#fb923c' : 'var(--text-ghost)' }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-bright)' }}>{team.teamName}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>
                        {team.wins}승 {team.losses}패 · 승률 {winRate}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold" style={{ color: 'var(--accent-star)' }}>{team.elo}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>Elo</div>
                    </div>
                    {/* Elo bar */}
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((team.elo - 800) / 800) * 100)}%`, background: 'var(--grad-nebula)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div>
            {!matchA || !matchB ? (
              <div className="text-center py-20 glass-card p-12">
                <p className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>팀이 부족합니다</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-ghost)' }}>캠프에서 최소 2팀 이상 등록해주세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* VS */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-sm"
                       style={{ background: 'var(--grad-fire)', color: 'white', boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}>VS</div>
                </div>

                {[{ team: matchA, label: 'A', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(124,58,237,0.1))', color: 'var(--accent-star)' },
                  { team: matchB, label: 'B', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))', color: '#f87171' }
                ].map(({ team, label, gradient, color }) => {
                  const other = team === matchA ? matchB : matchA;
                  const isWinner = voted === team.teamCode;
                  const isLoser = voted && voted !== team.teamCode;
                  return (
                    <motion.div key={`${team.teamCode}-${roundCount}`}
                      initial={{ opacity: 0, x: label === 'A' ? -50 : 50 }} animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300"
                      style={{
                        borderColor: isWinner ? 'var(--color-success)' : isLoser ? 'rgba(239,68,68,0.15)' : 'var(--border-dim)',
                        opacity: isLoser ? 0.4 : 1,
                        boxShadow: isWinner ? '0 0 30px rgba(16,185,129,0.15)' : 'none',
                      }}
                      onClick={() => !voted && handleVote(team, other!)}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-4" style={{ background: gradient, color }}>
                        {label}
                      </div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-bright)' }}>Team {label}</h3>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-ghost)' }}>(블라인드)</p>
                      <p className="text-sm font-mono mb-2" style={{ color: 'var(--text-muted)' }}>{team.teamName.replace(/./g, '?')}</p>
                      <div className="text-[11px] mb-4" style={{ color: 'var(--text-ghost)' }}>
                        {team.wins + team.losses}전 {team.wins}승 · Elo {team.elo}
                      </div>
                      {!voted && <button className="btn-primary w-full text-sm">이쪽에 투표 (+{VP_PER_VOTE}VP)</button>}
                      {isWinner && (
                        <div className="mt-4 space-y-1">
                          <div className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>WIN</div>
                          <div className="text-xs font-mono" style={{ color: 'var(--color-success)' }}>
                            Elo {eloChange ? `+${eloChange.winner}` : ''}
                          </div>
                          <div className="text-[11px] mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                            실제 팀: <span style={{ color: 'var(--accent-star)' }}>{team.teamName}</span>
                          </div>
                        </div>
                      )}
                      {isLoser && (
                        <div className="mt-4 space-y-1">
                          <div className="text-sm" style={{ color: 'var(--color-danger)' }}>패배</div>
                          <div className="text-xs font-mono" style={{ color: 'var(--color-danger)' }}>
                            Elo {eloChange ? eloChange.loser : ''}
                          </div>
                          <div className="text-[11px] mt-2" style={{ color: 'var(--text-ghost)' }}>
                            {team.teamName}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                <div className="md:hidden flex justify-center -my-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xs"
                       style={{ background: 'var(--grad-fire)', color: 'white' }}>VS</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
