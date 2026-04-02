'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketItem } from '@/types';
import { getData, setData, STORAGE_KEYS } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';
import { useDeepWork } from '@/contexts/DeepWorkContext';

type Category = 'all' | 'prompt' | 'component' | 'template';
const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'prompt', label: '프롬프트' },
  { key: 'component', label: '컴포넌트' },
  { key: 'template', label: '템플릿' },
];

export default function MarketPage() {
  const { user, deductPoints, addPoints } = useUser();
  const { isDeepWork } = useDeepWork();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSellForm, setShowSellForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', promptContent: '', category: 'prompt' as 'prompt' | 'component' | 'template', price: 200 });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(() => {
    const m = getData<MarketItem[]>(STORAGE_KEYS.MARKET);
    if (m) setItems(m);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('slot-switched', loadData);
    return () => window.removeEventListener('slot-switched', loadData);
  }, [loadData]);

  // ===== BUY ITEM =====
  const handleBuy = (item: MarketItem) => {
    if (isDeepWork) { showToast('딥워크 모드에서는 마켓을 이용할 수 없습니다', 'error'); return; }
    if (item.sold) { showToast('이미 판매된 아이템입니다', 'error'); return; }
    if (item.sellerTeamCode === user?.teamCode) { showToast('자기 팀 아이템은 구매할 수 없습니다', 'error'); return; }
    if (!deductPoints(item.price)) { showToast(`VP가 부족합니다! (필요: ${item.price}VP)`, 'error'); return; }

    // Re-read to prevent race condition / double-buy
    const allItems = getData<MarketItem[]>(STORAGE_KEYS.MARKET) || [];
    const idx = allItems.findIndex(i => i.id === item.id);
    if (idx === -1 || allItems[idx].sold) {
      // Refund if item already sold
      addPoints(item.price);
      showToast('이미 판매된 아이템입니다', 'error');
      loadData();
      return;
    }
    if (idx !== -1) {
      allItems[idx].sold = true;
      allItems[idx].buyerTeamCode = user?.teamCode || 'buyer';
      setData(STORAGE_KEYS.MARKET, allItems);
    }

    // Add to buyer's prompt collection
    const prompts = getData<any[]>(STORAGE_KEYS.PROMPTS) || [];
    prompts.push({
      id: `bought_${Date.now()}`, teamCode: user?.teamCode || 'buyer', title: `[구매] ${item.title}`,
      content: item.promptContent, variables: [], version: 'v1.0', previousVersionId: null,
      authorNickname: item.sellerTeamName, createdAt: new Date().toISOString(),
    });
    setData(STORAGE_KEYS.PROMPTS, prompts);

    showToast(`"${item.title}" 구매 완료! -${item.price}VP`);
    loadData();
  };

  // ===== SELL ITEM =====
  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.teamCode) { showToast('팀에 가입해야 판매할 수 있습니다', 'error'); return; }
    const cleanTitle = newItem.title.replace(/[<>"'&]/g, '').trim().slice(0, 50);
    const cleanDesc = newItem.description.replace(/[<>"'&]/g, '').trim().slice(0, 200);
    const cleanContent = newItem.promptContent.trim().slice(0, 2000);
    if (!cleanTitle || !cleanContent) return;
    if (newItem.price < 50 || newItem.price > 10000 || !Number.isFinite(newItem.price)) {
      showToast('가격은 50~10000VP 사이여야 합니다', 'error'); return;
    }

    const allItems = getData<MarketItem[]>(STORAGE_KEYS.MARKET) || [];
    allItems.push({
      id: `market_${Date.now()}`, sellerTeamCode: user.teamCode, sellerTeamName: user.nickname || 'Anonymous',
      title: cleanTitle, description: cleanDesc, promptContent: cleanContent,
      category: newItem.category, price: Math.floor(newItem.price), sold: false, buyerTeamCode: null,
      createdAt: new Date().toISOString(),
    });
    setData(STORAGE_KEYS.MARKET, allItems);
    addPoints(10);
    showToast(`"${newItem.title}" 등록 완료! +10VP`);
    setNewItem({ title: '', description: '', promptContent: '', category: 'prompt', price: 200 });
    setShowSellForm(false);
    loadData();
  };

  const filteredItems = items
    .filter(i => category === 'all' || i.category === category)
    .filter(i => !searchQuery || i.title.includes(searchQuery) || i.description.includes(searchQuery));

  const availableCount = items.filter(i => !i.sold).length;
  const soldCount = items.filter(i => i.sold).length;

  return (
    <div className="min-h-screen py-10 px-4">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl"
            style={{ background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white' }}>{toast.msg}</motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#fb923c' }}>MARKET</p>
              <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-bright)' }}>프롬프트 마켓</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>검증된 프롬프트와 컴포넌트를 VP로 거래하세요</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="font-bold" style={{ color: 'var(--color-success)' }}>{availableCount}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>판매중</div>
              </div>
              <div className="text-center">
                <div className="font-bold" style={{ color: 'var(--text-ghost)' }}>{soldCount}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>판매됨</div>
              </div>
              <button onClick={() => setShowSellForm(!showSellForm)} className={showSellForm ? 'btn-ghost text-xs' : 'btn-primary text-xs'}>
                {showSellForm ? '← 마켓' : '+ 판매등록'}
              </button>
            </div>
          </div>

          {isDeepWork && (
            <div className="mt-4 p-3 rounded-xl text-sm font-semibold text-center"
                 style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              DEEP WORK MODE - 마켓 구매가 제한됩니다
            </div>
          )}
        </motion.div>

        {showSellForm ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleSell} className="glass-card p-6 max-w-lg mx-auto space-y-4">
              <h3 className="font-bold" style={{ color: 'var(--text-bright)' }}>아이템 등록 <span className="text-[11px] font-normal" style={{ color: 'var(--text-ghost)' }}>+10VP</span></h3>
              <input required value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="아이템 이름" />
              <input value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="설명" />
              <textarea required value={newItem.promptContent} onChange={e => setNewItem(p => ({ ...p, promptContent: e.target.value }))}
                className="input-field min-h-[100px] font-mono text-sm" placeholder="프롬프트 내용" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value as 'prompt' | 'component' | 'template' }))} className="input-field">
                  <option value="prompt">프롬프트</option><option value="component">컴포넌트</option><option value="template">템플릿</option>
                </select>
                <div className="flex items-center gap-2">
                  <input type="number" min={50} step={50} value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: Number(e.target.value) }))} className="input-field" />
                  <span className="text-xs font-mono" style={{ color: 'var(--text-ghost)' }}>VP</span>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">등록하기 (+10VP)</button>
            </form>
          </motion.div>
        ) : (
          <>
            {/* Search + Filters */}
            <div className="flex gap-3 mb-6">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field flex-1" placeholder="검색..." />
            </div>
            <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setCategory(cat.key)}
                  className="flex-1 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all"
                  style={category === cat.key ? { background: 'rgba(249,115,22,0.15)', color: '#fb923c' } : { color: 'var(--text-ghost)' }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-16" style={{ color: 'var(--text-ghost)' }}><p>등록된 아이템이 없습니다</p></div>
              ) : filteredItems.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`glass-card p-5 flex flex-col ${item.sold ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`badge text-[10px] ${item.category === 'prompt' ? 'badge-primary' : item.category === 'component' ? 'badge-aurora' : 'badge-warning'}`}>
                      {CATEGORIES.find(c => c.key === item.category)?.label || item.category}
                    </span>
                    {item.sold && <span className="badge badge-danger text-[10px]">품절</span>}
                  </div>
                  <h3 className="font-bold mb-1 text-sm line-clamp-2" style={{ color: 'var(--text-bright)' }}>{item.title}</h3>
                  <p className="text-[12px] mb-3 flex-1 line-clamp-3" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                  <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: '1px solid var(--border-dim)' }}>
                    <div>
                      <div className="font-bold font-mono" style={{ color: '#fb923c' }}>{item.price}<span className="text-[10px] ml-0.5">VP</span></div>
                      <div className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>by {item.sellerTeamName}</div>
                    </div>
                    {!item.sold ? (
                      <button onClick={() => handleBuy(item)} className="btn-primary text-xs py-1.5 px-4">구매하기</button>
                    ) : (
                      <span className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>sold to {item.buyerTeamCode}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
