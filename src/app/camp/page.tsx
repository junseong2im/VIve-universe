'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Team, PromptTemplate, PromptVariable } from '@/types';
import { getData, setData, STORAGE_KEYS } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

function CampContent() {
  const searchParams = useSearchParams();
  const hackathonFilter = searchParams.get('hackathon');
  const { user, joinTeam, addPoints } = useUser();

  const [teams, setTeams] = useState<Team[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'workspace'>('list');
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [newTeam, setNewTeam] = useState({
    name: '', intro: '', lookingFor: '', contactUrl: '', hackathonSlug: hackathonFilter || 'daker-handover-2026-03',
  });
  const [newPrompt, setNewPrompt] = useState({ title: '', content: '', variables: '' });
  const [filledVars, setFilledVars] = useState<Record<string, Record<string, string>>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(() => {
    const t = getData<Team[]>(STORAGE_KEYS.TEAMS);
    if (t) setTeams(hackathonFilter ? t.filter(x => x.hackathonSlug === hackathonFilter) : t);
    const p = getData<PromptTemplate[]>(STORAGE_KEYS.PROMPTS);
    if (p) setPrompts(user?.teamCode ? p.filter(x => x.teamCode === user.teamCode) : p);
  }, [hackathonFilter, user?.teamCode]);

  useEffect(() => {
    loadData();
    window.addEventListener('slot-switched', loadData);
    return () => window.removeEventListener('slot-switched', loadData);
  }, [loadData]);

  // ===== CREATE TEAM =====
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;
    const teamCode = `T-${Date.now().toString(36).toUpperCase()}`;
    const team: Team = {
      teamCode, hackathonSlug: newTeam.hackathonSlug, name: newTeam.name.trim(), isOpen: true, memberCount: 1,
      lookingFor: newTeam.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
      intro: newTeam.intro, contact: { type: 'link', url: newTeam.contactUrl }, createdAt: new Date().toISOString(),
    };
    const allTeams = getData<Team[]>(STORAGE_KEYS.TEAMS) || [];
    allTeams.push(team);
    setData(STORAGE_KEYS.TEAMS, allTeams);

    // Auto-join + Arena rating
    joinTeam(teamCode);
    const ratings = getData<any[]>(STORAGE_KEYS.ARENA_RATINGS) || [];
    ratings.push({ teamCode, teamName: team.name, elo: 1200, wins: 0, losses: 0 });
    setData(STORAGE_KEYS.ARENA_RATINGS, ratings);

    addPoints(30);
    showToast(`팀 "${team.name}" 생성 완료! +30VP`);
    setNewTeam({ name: '', intro: '', lookingFor: '', contactUrl: '', hackathonSlug: newTeam.hackathonSlug });
    loadData();
    setActiveTab('workspace');
  };

  // ===== JOIN TEAM =====
  const handleJoinTeam = (team: Team) => {
    if (user?.teamCode === team.teamCode) { showToast('이미 이 팀에 속해 있습니다'); return; }
    if (user?.teamCode) { showToast('다른 팀에서 먼저 탈퇴해야 합니다'); return; }
    if (!team.isOpen) { showToast('모집이 마감된 팀입니다'); return; }

    // Update team member count
    const allTeams = getData<Team[]>(STORAGE_KEYS.TEAMS) || [];
    const idx = allTeams.findIndex(t => t.teamCode === team.teamCode);
    if (idx !== -1) { allTeams[idx].memberCount += 1; setData(STORAGE_KEYS.TEAMS, allTeams); }

    joinTeam(team.teamCode);
    addPoints(20);
    showToast(`"${team.name}" 팀에 참가! +20VP`);
    loadData();
  };

  // ===== CREATE PROMPT =====
  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.teamCode) { showToast('팀에 먼저 가입하세요!'); return; }
    if (!newPrompt.title.trim() || !newPrompt.content.trim()) return;

    const vars: PromptVariable[] = newPrompt.variables.split(',').map(v => v.trim()).filter(Boolean)
      .map(v => ({ name: v, placeholder: v }));
    const prompt: PromptTemplate = {
      id: `prompt_${Date.now()}`, teamCode: user.teamCode, title: newPrompt.title.trim(), content: newPrompt.content,
      variables: vars, version: 'v1.0', previousVersionId: null, authorNickname: user.nickname || 'Anonymous',
      createdAt: new Date().toISOString(),
    };
    const all = getData<PromptTemplate[]>(STORAGE_KEYS.PROMPTS) || [];
    all.push(prompt);
    setData(STORAGE_KEYS.PROMPTS, all);
    addPoints(15);
    showToast(`프롬프트 "${prompt.title}" 등록! +15VP`);
    setNewPrompt({ title: '', content: '', variables: '' });
    loadData();
  };

  // ===== DELETE PROMPT =====
  const handleDeletePrompt = (id: string) => {
    const all = getData<PromptTemplate[]>(STORAGE_KEYS.PROMPTS) || [];
    const updated = all.filter(p => p.id !== id);
    setData(STORAGE_KEYS.PROMPTS, updated);
    showToast('프롬프트 삭제됨');
    loadData();
  };

  // ===== SELL PROMPT TO MARKET =====
  const handleSellPrompt = (prompt: PromptTemplate) => {
    const marketItems = getData<any[]>(STORAGE_KEYS.MARKET) || [];
    marketItems.push({
      id: `market_${Date.now()}`, sellerTeamCode: prompt.teamCode, sellerTeamName: prompt.authorNickname,
      title: prompt.title, description: `${prompt.variables.length}개 변수 포함 프롬프트 템플릿`,
      promptContent: prompt.content, category: 'prompt', price: 200, sold: false, buyerTeamCode: null,
      createdAt: new Date().toISOString(),
    });
    setData(STORAGE_KEYS.MARKET, marketItems);
    addPoints(10);
    showToast(`"${prompt.title}" 마켓에 등록! +10VP`);
  };

  const buildPromptText = (prompt: PromptTemplate, vars: Record<string, string>) => {
    let text = prompt.content;
    prompt.variables.forEach(v => { text = text.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), vars[v.name] || `[${v.placeholder}]`); });
    return text;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const TABS = [
    { key: 'list', label: '팀 목록', count: teams.length },
    { key: 'create', label: '팀 생성', count: null },
    { key: 'workspace', label: '프롬프트', count: prompts.length },
  ];

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
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--accent-aurora)' }}>CAMP</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-bright)' }}>캠프</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {user?.teamCode ? `현재 팀: ${user.teamCode}` : '팀에 가입하거나 새로 만드세요'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-2"
              style={activeTab === tab.key
                ? { background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }
                : { color: 'var(--text-ghost)' }
              }>
              {tab.label}
              {tab.count !== null && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {teams.length === 0 ? (
                <div className="text-center py-20 glass-card p-12">
                  <p className="text-lg font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>등록된 팀이 없습니다</p>
                  <button onClick={() => setActiveTab('create')} className="btn-primary text-sm">팀 만들기</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map(team => (
                    <div key={team.teamCode} className="glass-card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                               style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-star)' }}>{team.name.charAt(0)}</div>
                          <div>
                            <h3 className="font-bold" style={{ color: 'var(--text-bright)' }}>{team.name}</h3>
                            <p className="text-[11px] font-mono" style={{ color: 'var(--text-ghost)' }}>{team.teamCode}</p>
                          </div>
                        </div>
                        <span className={`badge ${team.isOpen ? 'badge-success' : 'badge-danger'}`}>{team.isOpen ? '모집중' : '마감'}</span>
                      </div>
                      {team.intro && <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{team.intro}</p>}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {team.lookingFor.map(role => <span key={role} className="badge badge-aurora text-[11px]">{role}</span>)}
                      </div>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
                        <span className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>{team.memberCount}명</span>
                        {user?.teamCode === team.teamCode ? (
                          <span className="badge badge-success text-[11px]">내 팀</span>
                        ) : team.isOpen ? (
                          <button onClick={() => handleJoinTeam(team)} className="btn-primary text-xs py-1.5 px-3">참가 신청 (+20VP)</button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <form onSubmit={handleCreateTeam} className="glass-card p-6 max-w-lg mx-auto space-y-4">
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-bright)' }}>새 팀 만들기 <span className="text-[11px] font-normal" style={{ color: 'var(--text-ghost)' }}>+30VP</span></h3>
                <div><label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-ghost)' }}>팀명 *</label>
                  <input required value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="팀 이름" maxLength={20} /></div>
                <div><label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-ghost)' }}>소개 *</label>
                  <textarea required value={newTeam.intro} onChange={e => setNewTeam(p => ({ ...p, intro: e.target.value }))} className="input-field min-h-[80px]" placeholder="팀 소개" /></div>
                <div><label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-ghost)' }}>모집 포지션 (쉼표 구분)</label>
                  <input value={newTeam.lookingFor} onChange={e => setNewTeam(p => ({ ...p, lookingFor: e.target.value }))} className="input-field" placeholder="Frontend, Designer, PM" /></div>
                <div><label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-ghost)' }}>연락 링크</label>
                  <input type="url" value={newTeam.contactUrl} onChange={e => setNewTeam(p => ({ ...p, contactUrl: e.target.value }))} className="input-field" placeholder="https://open.kakao.com/..." /></div>
                <button type="submit" className="btn-primary w-full">팀 생성하기 (+30VP)</button>
              </form>
            </motion.div>
          )}

          {activeTab === 'workspace' && (
            <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!user?.teamCode && (
                <div className="glass-card p-6 mb-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>팀에 가입하면 프롬프트 워크스페이스를 사용할 수 있습니다</p>
                  <button onClick={() => setActiveTab('list')} className="btn-primary text-xs mt-3">팀 찾기</button>
                </div>
              )}

              {user?.teamCode && (
                <div className="glass-card p-6 mb-6">
                  <h3 className="font-bold mb-4" style={{ color: 'var(--text-bright)' }}>새 프롬프트 <span className="text-[11px] font-normal" style={{ color: 'var(--text-ghost)' }}>+15VP</span></h3>
                  <form onSubmit={handleCreatePrompt} className="space-y-3">
                    <input required value={newPrompt.title} onChange={e => setNewPrompt(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="프롬프트 제목" />
                    <textarea required value={newPrompt.content} onChange={e => setNewPrompt(p => ({ ...p, content: e.target.value }))}
                      className="input-field min-h-[100px] font-mono text-sm" placeholder="프롬프트 내용 (변수: {{변수명}})" />
                    <input value={newPrompt.variables} onChange={e => setNewPrompt(p => ({ ...p, variables: e.target.value }))} className="input-field" placeholder="변수명 (쉼표 구분): theme, color, name" />
                    <button type="submit" className="btn-primary text-sm">등록하기 (+15VP)</button>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {prompts.length === 0 ? (
                  <div className="text-center py-12" style={{ color: 'var(--text-ghost)' }}><p>등록된 프롬프트가 없습니다</p></div>
                ) : prompts.map(prompt => (
                  <div key={prompt.id} className="glass-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--text-bright)' }}>{prompt.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="badge badge-primary text-[10px]">{prompt.version}</span>
                          <span className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>by {prompt.authorNickname}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleSellPrompt(prompt)} className="px-2 py-1 rounded text-[10px] font-semibold"
                          style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>마켓에 판매</button>
                        <button onClick={() => handleDeletePrompt(prompt.id)} className="px-2 py-1 rounded text-[10px]"
                          style={{ color: 'var(--color-danger)' }}>삭제</button>
                      </div>
                    </div>

                    <div className="rounded-xl p-4 font-mono text-sm mb-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <pre className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                        {buildPromptText(prompt, filledVars[prompt.id] || {})}
                      </pre>
                    </div>

                    {prompt.variables.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {prompt.variables.map(v => (
                          <input key={v.name} placeholder={`{{${v.placeholder}}}`} className="input-field text-sm py-2"
                            value={filledVars[prompt.id]?.[v.name] || ''}
                            onChange={e => setFilledVars(prev => ({ ...prev, [prompt.id]: { ...(prev[prompt.id] || {}), [v.name]: e.target.value } }))} />
                        ))}
                      </div>
                    )}

                    <button onClick={() => handleCopy(prompt.id, buildPromptText(prompt, filledVars[prompt.id] || {}))}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={copied === prompt.id
                        ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
                        : { background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }
                      }>{copied === prompt.id ? 'Copied!' : '클립보드 복사'}</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CampPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p style={{ color: 'var(--text-ghost)' }}>로딩중...</p></div>}>
      <CampContent />
    </Suspense>
  );
}
