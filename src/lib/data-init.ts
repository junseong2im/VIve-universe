import { getData, setData, STORAGE_KEYS } from './storage';
import { Hackathon, HackathonDetail, Team, Leaderboard, User, MarketItem, ArenaTeamRating, PromptTemplate } from '@/types';

const INIT_FLAG = 'vibe_initialized';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createDefaultUser(): User {
  return {
    id: `user_${generateId()}`,
    nickname: '',
    vibePoints: 1000,
    teamCode: null,
    investments: [],
    createdAt: new Date().toISOString(),
  };
}

function createDefaultMarketItems(): MarketItem[] {
  return [
    {
      id: `market_${generateId()}`,
      sellerTeamCode: 'T-HANDOVER-01',
      sellerTeamName: '404found',
      title: '반응형 네비게이션 바 프롬프트',
      description: '모바일/데스크톱 반응형 GNB를 생성하는 검증된 프롬프트입니다. 다크모드 지원.',
      promptContent: 'Create a responsive navigation bar with {{theme}} theme, {{menuCount}} menu items, and {{brandName}} as the logo. Include mobile hamburger menu with smooth animation.',
      category: 'prompt',
      price: 300,
      sold: false,
      buyerTeamCode: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: `market_${generateId()}`,
      sellerTeamCode: 'T-HANDOVER-02',
      sellerTeamName: 'LGTM',
      title: '글래스모피즘 카드 컴포넌트',
      description: '최신 글래스모피즘 트렌드의 카드 UI. 호버 애니메이션 포함.',
      promptContent: 'Build a glassmorphism card component with {{width}} width, {{bgOpacity}} opacity, and backdrop-blur. Add hover scale effect and {{accentColor}} border glow.',
      category: 'component',
      price: 500,
      sold: false,
      buyerTeamCode: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: `market_${generateId()}`,
      sellerTeamCode: 'T-ALPHA',
      sellerTeamName: 'Team Alpha',
      title: 'AI 챗봇 인터페이스 템플릿',
      description: '실시간 스트리밍 응답이 가능한 챗봇 UI 프롬프트. 타이핑 애니메이션 포함.',
      promptContent: 'Create a chat interface with {{modelName}} AI integration. Include typing animation, message bubbles with {{bubbleStyle}} style, and {{inputPlaceholder}} as placeholder.',
      category: 'template',
      price: 800,
      sold: false,
      buyerTeamCode: null,
      createdAt: new Date().toISOString(),
    },
  ];
}

function createDefaultArenaRatings(teams: Team[]): ArenaTeamRating[] {
  return teams.map(team => ({
    teamCode: team.teamCode,
    teamName: team.name,
    elo: 1200,
    wins: 0,
    losses: 0,
  }));
}

function createDefaultPrompts(): PromptTemplate[] {
  return [
    {
      id: `prompt_${generateId()}`,
      teamCode: 'T-HANDOVER-01',
      title: '랜딩 페이지 히어로 섹션',
      content: '{{framework}}로 {{projectName}} 프로젝트의 히어로 섹션을 만들어줘. {{colorScheme}} 컬러 스킴을 사용하고, CTA 버튼에는 "{{ctaText}}" 텍스트를 넣어줘.',
      variables: [
        { name: 'framework', placeholder: 'React / Vue / Svelte' },
        { name: 'projectName', placeholder: '프로젝트명' },
        { name: 'colorScheme', placeholder: '다크 / 라이트 / 네온' },
        { name: 'ctaText', placeholder: '시작하기' },
      ],
      version: 'v1.0',
      previousVersionId: null,
      authorNickname: '김바이브',
      createdAt: new Date().toISOString(),
    },
    {
      id: `prompt_${generateId()}`,
      teamCode: 'T-HANDOVER-01',
      title: '데이터 테이블 컴포넌트',
      content: '{{library}}를 사용해서 {{dataType}} 데이터를 보여주는 테이블을 만들어줘. 정렬, 필터, 페이지네이션 기능을 포함하고 {{rowCount}}개 행을 기본으로 보여줘.',
      variables: [
        { name: 'library', placeholder: 'TanStack Table / AG Grid' },
        { name: 'dataType', placeholder: '유저 / 주문 / 상품' },
        { name: 'rowCount', placeholder: '10' },
      ],
      version: 'v1.0',
      previousVersionId: null,
      authorNickname: '이프롬프트',
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function initializeData(): Promise<void> {
  if (typeof window === 'undefined') return;

  const initialized = localStorage.getItem(INIT_FLAG);
  if (initialized) return;

  try {
    // Fetch all JSON data
    const [hackathonsRes, detailRes, teamsRes, leaderboardRes] = await Promise.all([
      fetch('/data/hackathons.json'),
      fetch('/data/hackathon_detail.json'),
      fetch('/data/teams.json'),
      fetch('/data/leaderboard.json'),
    ]);

    const hackathons: Hackathon[] = await hackathonsRes.json();
    const detailRaw: HackathonDetail & { extraDetails?: HackathonDetail[] } = await detailRes.json();
    const teams: Team[] = await teamsRes.json();
    const leaderboard: Leaderboard = await leaderboardRes.json();

    // Build details array from main + extraDetails
    const details: HackathonDetail[] = [
      { slug: detailRaw.slug, title: detailRaw.title, sections: detailRaw.sections },
    ];
    if (detailRaw.extraDetails) {
      detailRaw.extraDetails.forEach(d => {
        details.push({ slug: d.slug, title: d.title, sections: d.sections });
      });
    }

    // Build leaderboards array
    const leaderboards: Leaderboard[] = [
      { hackathonSlug: leaderboard.hackathonSlug, updatedAt: leaderboard.updatedAt, entries: leaderboard.entries },
    ];
    if (leaderboard.extraLeaderboards) {
      leaderboard.extraLeaderboards.forEach(lb => {
        leaderboards.push(lb);
      });
    }

    // Save to all 3 slots
    for (let slot = 1; slot <= 3; slot++) {
      const prefix = `vibe_slot_${slot}_`;
      localStorage.setItem(`${prefix}${STORAGE_KEYS.HACKATHONS}`, JSON.stringify(hackathons));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.HACKATHON_DETAILS}`, JSON.stringify(details));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.TEAMS}`, JSON.stringify(teams));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.LEADERBOARD}`, JSON.stringify(leaderboards));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.USER}`, JSON.stringify(createDefaultUser()));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.MARKET}`, JSON.stringify(createDefaultMarketItems()));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.ARENA_RATINGS}`, JSON.stringify(createDefaultArenaRatings(teams)));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.ARENA_MATCHES}`, JSON.stringify([]));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.PROMPTS}`, JSON.stringify(createDefaultPrompts()));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.INVESTMENTS}`, JSON.stringify([]));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.SECTIONS}`, JSON.stringify({}));
      localStorage.setItem(`${prefix}${STORAGE_KEYS.TIMELAPSE}`, JSON.stringify([]));
    }

    localStorage.setItem(INIT_FLAG, 'true');
    localStorage.setItem('vibe_active_slot', '1');
    console.log('[OK] VIBE UNIVERSE data initialized successfully');
  } catch (error) {
    console.error('[ERROR] Failed to initialize data:', error);
    throw error;
  }
}

export function resetAllData(): void {
  // Clear everything and reinitialize
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('vibe')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  // Remove init flag to allow reinitialize
  localStorage.removeItem(INIT_FLAG);
}
