'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HackathonDetail, RestorationState, SectionKey, Team, Leaderboard, LeaderboardEntry, Investment } from '@/types';
import { getData, setData, STORAGE_KEYS } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

const VP_PER_RESTORE = 50;
const VP_FULL_BONUS = 200;

const SECTION_ORDER: { key: SectionKey; label: string; desc: string }[] = [
  { key: 'overview', label: '개요', desc: 'Overview' },
  { key: 'info', label: '안내', desc: 'Information' },
  { key: 'eval', label: '평가', desc: 'Evaluation' },
  { key: 'schedule', label: '일정', desc: 'Schedule' },
  { key: 'prize', label: '상금', desc: 'Prize' },
  { key: 'teams', label: '팀', desc: 'Teams' },
  { key: 'submit', label: '제출', desc: 'Submission' },
];

export default function HackathonDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, addPoints, deductPoints } = useUser();

  const [detail, setDetail] = useState<HackathonDetail | null>(null);
  const [restorationState, setRestorationState] = useState<Record<string, boolean>>({});
  const [restoringKey, setRestoringKey] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submitData, setSubmitData] = useState<Record<string, string>>({});
  const [investAmount, setInvestAmount] = useState(100);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(() => {
    const details = getData<HackathonDetail[]>(STORAGE_KEYS.HACKATHON_DETAILS);
    const found = details?.find(d => d.slug === slug);
    if (found) setDetail(found);

    const sections = getData<RestorationState>(STORAGE_KEYS.SECTIONS);
    if (sections && sections[slug]) setRestorationState(sections[slug] as Record<string, boolean>);

    const lbs = getData<Leaderboard[]>(STORAGE_KEYS.LEADERBOARD);
    const lb = lbs?.find(l => l.hackathonSlug === slug);
    if (lb) setLeaderboard(lb.entries);

    const t = getData<Team[]>(STORAGE_KEYS.TEAMS);
    if (t) setTeams(t.filter(team => team.hackathonSlug === slug));

    const investments = getData<Investment[]>(STORAGE_KEYS.INVESTMENTS) || [];
    setMyInvestments(investments);
  }, [slug]);

  useEffect(() => {
    loadData();
    window.addEventListener('slot-switched', loadData);
    return () => window.removeEventListener('slot-switched', loadData);
  }, [loadData]);

  // ===== RESTORE SECTION → +VP =====
  const handleRestore = (sectionKey: SectionKey) => {
    if (restorationState[sectionKey] || restoringKey) return;
    setRestoringKey(sectionKey);

    setTimeout(() => {
      const sections = getData<RestorationState>(STORAGE_KEYS.SECTIONS) || {};
      if (!sections[slug]) sections[slug] = {};
      sections[slug][sectionKey] = true;
      setData(STORAGE_KEYS.SECTIONS, sections);

      const newState = { ...restorationState, [sectionKey]: true };
      setRestorationState(newState);
      setRestoringKey(null);

      // VP reward
      addPoints(VP_PER_RESTORE);
      showToast(`+${VP_PER_RESTORE}VP 복원 보상 획득!`);

      // Full restore bonus
      const totalRestored = Object.values(newState).filter(Boolean).length;
      if (totalRestored === SECTION_ORDER.length) {
        setTimeout(() => {
          addPoints(VP_FULL_BONUS);
          showToast(`전체 복원 보너스 +${VP_FULL_BONUS}VP!`);
        }, 800);
      }
    }, 1200);
  };

  // ===== INVEST IN TEAM =====
  const handleInvest = (teamName: string, teamCode: string) => {
    if (investAmount < 50) { showToast('최소 50VP부터 투자 가능합니다', 'error'); return; }
    if (!deductPoints(investAmount)) { showToast('Vibe Point가 부족합니다!', 'error'); return; }

    const investments = getData<Investment[]>(STORAGE_KEYS.INVESTMENTS) || [];
    const totalPool = investments.reduce((s, i) => s + i.amount, 0) + investAmount;
    const teamPool = investments.filter(i => i.teamCode === teamCode).reduce((s, i) => s + i.amount, 0) + investAmount;
    const odds = Math.max(1.1, Math.round((totalPool / teamPool) * 10) / 10);

    investments.push({
      id: `inv_${Date.now()}`, teamCode, teamName, amount: investAmount,
      odds, settled: false, payout: 0, createdAt: new Date().toISOString(),
    });
    setData(STORAGE_KEYS.INVESTMENTS, investments);
    setMyInvestments(investments);
    showToast(`${teamName}에 ${investAmount}VP 투자! (배당률: ${odds}x)`);
  };

  // ===== SUBMIT =====
  const handleSubmit = () => {
    const allFields = detail?.sections.submit.submissionItems || [];
    const missing = allFields.filter(item => !submitData[item.key]?.trim());
    if (missing.length > 0) {
      showToast(`${missing.map(m => m.title).join(', ')} 항목을 입력하세요`, 'error');
      return;
    }
    // Save submission
    const submissions = getData<any[]>('submissions') || [];
    submissions.push({
      hackathonSlug: slug,
      teamCode: user?.teamCode || 'solo',
      data: submitData,
      submittedAt: new Date().toISOString(),
    });
    setData('submissions', submissions);
    addPoints(100);
    setSubmitted(true);
    showToast('제출 완료! +100VP 보상 획득!');
  };

  const restoredCount = Object.values(restorationState).filter(Boolean).length;
  const totalSections = SECTION_ORDER.length;
  const progressPercent = Math.round((restoredCount / totalSections) * 100);
  const totalInvested = myInvestments.reduce((s, i) => s + i.amount, 0);

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>해커톤을 찾을 수 없습니다</p>
          <Link href="/hackathons" className="btn-primary text-sm">← 목록으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl"
            style={{
              background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
              color: 'white', backdropFilter: 'blur(10px)',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/hackathons" className="text-xs mb-4 inline-flex items-center gap-1 transition-colors hover:text-[var(--accent-star)]" style={{ color: 'var(--text-ghost)' }}>
            ← 해커톤 목록
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-bright)' }}>{detail.title}</h1>

          {/* Progress + Stats */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>시스템 복원 진행률</span>
              <span className="text-xs font-mono font-bold" style={{ color: progressPercent === 100 ? 'var(--color-success)' : 'var(--accent-star)' }}>
                {restoredCount}/{totalSections} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div className="h-full rounded-full" style={{ background: progressPercent === 100 ? 'var(--color-success)' : 'var(--grad-cosmic)' }}
                initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} />
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px]" style={{ color: 'var(--text-ghost)' }}>
              <span>획득 VP: <strong style={{ color: '#fb923c' }}>{restoredCount * VP_PER_RESTORE}{progressPercent === 100 ? ` + ${VP_FULL_BONUS}` : ''}</strong></span>
              <span>투자 합계: <strong style={{ color: '#a78bfa' }}>{totalInvested}VP</strong></span>
            </div>
            {progressPercent === 100 && (
              <p className="text-xs mt-3 text-center font-bold" style={{ color: 'var(--color-success)' }}>모든 섹션 복원 완료!</p>
            )}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTION_ORDER.map((section, idx) => {
            const isRestored = restorationState[section.key] || false;
            const isRestoring = restoringKey === section.key;

            return (
              <motion.div key={section.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }} id={`section-${section.key}`}>

                {!isRestored ? (
                  /* ===== PRE-RESTORE ===== */
                  <div className="analog-panel" style={{ opacity: isRestoring ? 0.5 : 1, transition: 'opacity 0.5s' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                           style={{ background: 'rgba(124,58,237,0.1)', border: '1px dashed var(--border-subtle)' }}>
                        <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-star)' }}>{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-bright)', fontFamily: "'Nanum Pen Script', cursive" }}>{section.label}</h3>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-ghost)' }}>{section.desc}</span>
                      </div>
                      <span className="ml-auto badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>미복원</span>
                    </div>
                    <div className="text-sm space-y-1.5 mb-4" style={{ color: 'var(--text-secondary)', fontFamily: "'Nanum Pen Script', cursive" }}>
                      {section.key === 'overview' && detail.sections.overview && <p>{detail.sections.overview.summary}</p>}
                      {section.key === 'info' && detail.sections.info?.notice.map((n, i) => <p key={i}>• {n}</p>)}
                      {section.key === 'eval' && <p>평가 기준: {detail.sections.eval.metricName}</p>}
                      {section.key === 'schedule' && detail.sections.schedule?.milestones.slice(0, 2).map((m, i) => <p key={i}>- {m.name}</p>)}
                      {section.key === 'prize' && detail.sections.prize?.items?.slice(0, 2).map((p, i) => <p key={i}>{p.place}: {p.amountKRW.toLocaleString()}원</p>)}
                      {section.key === 'teams' && <p>{teams.length}개 팀 참가</p>}
                      {section.key === 'submit' && <p>제출 양식 확인 필요</p>}
                    </div>
                    <button onClick={() => handleRestore(section.key)} disabled={!!restoringKey}
                      className="btn-secondary text-xs disabled:opacity-30" style={{ borderStyle: 'dashed' }}>
                      {isRestoring ? '복원 중...' : `디지털 UI로 복원하기 (+${VP_PER_RESTORE}VP) →`}
                    </button>
                  </div>
                ) : (
                  /* ===== POST-RESTORE ===== */
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)' }}>
                        <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-star)' }}>{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-bright)' }}>{section.label}</h3>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-ghost)' }}>{section.desc}</span>
                      </div>
                      <span className="ml-auto badge badge-success">복원됨</span>
                    </div>

                    {section.key === 'overview' && (
                      <div className="space-y-3">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail.sections.overview.summary}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="badge badge-primary">{detail.sections.overview.teamPolicy.allowSolo ? '솔로 가능' : '팀 필수'}</span>
                          <span className="badge badge-primary">최대 {detail.sections.overview.teamPolicy.maxTeamSize}명</span>
                        </div>
                      </div>
                    )}
                    {section.key === 'info' && (
                      <div className="space-y-2">
                        {detail.sections.info.notice.map((n, i) => (
                          <div key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--accent-star)' }}>•</span><span>{n}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.key === 'eval' && (
                      <div className="space-y-3">
                        <p className="font-mono font-bold text-sm" style={{ color: 'var(--accent-star)' }}>{detail.sections.eval.metricName}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{detail.sections.eval.description}</p>
                        {detail.sections.eval.scoreDisplay?.breakdown && (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            {detail.sections.eval.scoreDisplay.breakdown.map(b => (
                              <div key={b.key} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="text-xl font-bold gradient-text">{b.weightPercent}%</div>
                                <div className="text-[11px] mt-1" style={{ color: 'var(--text-ghost)' }}>{b.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {section.key === 'schedule' && (
                      <div className="space-y-2.5">
                        {detail.sections.schedule.milestones.map((m, i) => {
                          const isPast = new Date(m.at) < new Date();
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: isPast ? 'var(--color-success)' : 'var(--accent-nebula)' }} />
                              <div>
                                <div className="text-sm font-medium" style={{ color: isPast ? 'var(--text-ghost)' : 'var(--text-bright)' }}>{m.name}</div>
                                <div className="text-[11px] font-mono" style={{ color: 'var(--text-ghost)' }}>{new Date(m.at).toLocaleString('ko-KR')}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {section.key === 'prize' && (
                      <div className="grid grid-cols-3 gap-3">
                        {detail.sections.prize?.items ? (
                          detail.sections.prize.items.map((p, i) => (
                            <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)' }}>
                              <div className="text-xl mb-1">{['1st', '2nd', '3rd'][i]}</div>
                              <div className="font-bold" style={{ color: '#fb923c' }}>{p.amountKRW.toLocaleString()}원</div>
                              <div className="text-[11px] mt-1" style={{ color: 'var(--text-ghost)' }}>{p.place}</div>
                            </div>
                          ))
                        ) : <div className="col-span-3 text-center text-sm" style={{ color: 'var(--text-muted)' }}>투표 점수 기반</div>}
                      </div>
                    )}
                    {section.key === 'teams' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{teams.length}팀 참가</span>
                          <Link href={`/camp?hackathon=${slug}`} className="btn-primary text-xs py-1.5 px-3">캠프 이동</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {teams.slice(0, 6).map(team => (
                            <div key={team.teamCode} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                                   style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-star)' }}>{team.name.charAt(0)}</div>
                              <div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-bright)' }}>{team.name}</div>
                                <div className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>{team.memberCount}명 · {team.isOpen ? '모집중' : '마감'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {section.key === 'submit' && (
                      <div className="space-y-3">
                        {detail.sections.submit.guide.map((g, i) => (
                          <p key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--accent-star)' }}>-</span> {g}
                          </p>
                        ))}
                        {!submitted ? (
                          <>
                            {detail.sections.submit.submissionItems?.map(item => (
                              <div key={item.key}>
                                <label className="text-[11px] uppercase tracking-wider block mb-1.5 font-semibold" style={{ color: 'var(--text-ghost)' }}>
                                  {item.title} <span className="text-red-400">*</span>
                                </label>
                                <input className="input-field" placeholder={`${item.format} 형식으로 입력`}
                                  value={submitData[item.key] || ''} onChange={e => setSubmitData(p => ({ ...p, [item.key]: e.target.value }))} />
                              </div>
                            ))}
                            <button onClick={handleSubmit} className="btn-primary w-full text-sm">제출하기 (+100VP)</button>
                          </>
                        ) : (
                          <div className="text-center py-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)' }}>
                            <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>제출 완료!</p>
                            <p className="text-[11px] mt-1" style={{ color: 'var(--text-ghost)' }}>결과 발표를 기다려주세요</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* ===== LEADERBOARD + INVESTMENT ===== */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
                  <svg width="16" height="16" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 21V16M12 21V10M16 21V4" /></svg>
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-bright)' }}>리더보드 & 투자</h3>
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>투자액:</label>
                  <select value={investAmount} onChange={e => setInvestAmount(Number(e.target.value))}
                    className="text-xs font-mono rounded-lg px-2 py-1" style={{ background: 'var(--bg-elevated)', color: 'var(--text-bright)', border: '1px solid var(--border-dim)' }}>
                    <option value={50}>50VP</option><option value={100}>100VP</option><option value={200}>200VP</option><option value={500}>500VP</option>
                  </select>
                </div>
              </div>

              {leaderboard.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-ghost)' }}>아직 결과가 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, idx) => {
                    const myInvest = myInvestments.filter(i => i.teamCode === `team-${idx}` || i.teamName === entry.teamName);
                    const myTotal = myInvest.reduce((s, i) => s + i.amount, 0);
                    return (
                      <div key={idx} className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold"
                             style={{ background: idx < 3 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)', color: idx < 3 ? '#fb923c' : 'var(--text-ghost)' }}>
                          {entry.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--text-bright)' }}>{entry.teamName}</div>
                          <div className="text-[11px] font-mono" style={{ color: 'var(--text-ghost)' }}>
                            점수: {entry.score}
                            {myTotal > 0 && <span style={{ color: '#a78bfa' }}> · 내 투자: {myTotal}VP</span>}
                          </div>
                        </div>
                        <button onClick={() => handleInvest(entry.teamName, entry.teamName)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0"
                          style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
                          {investAmount}VP 투자
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* My investments */}
              {myInvestments.length > 0 && (
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border-dim)' }}>
                  <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-ghost)' }}>내 투자 내역</h4>
                  <div className="space-y-1.5">
                    {myInvestments.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between text-[12px] px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{inv.teamName}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono" style={{ color: '#fb923c' }}>{inv.amount}VP</span>
                          <span className="font-mono" style={{ color: 'var(--accent-star)' }}>x{inv.odds}</span>
                          <span className={`badge text-[10px] ${inv.settled ? 'badge-success' : 'badge-warning'}`}>{inv.settled ? '정산완료' : '진행중'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
