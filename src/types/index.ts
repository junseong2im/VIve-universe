// ============ Hackathon Types ============
export interface HackathonPeriod {
  timezone: string;
  submissionDeadlineAt: string;
  endAt: string;
}

export interface HackathonLinks {
  detail: string;
  rules: string;
  faq: string;
}

export interface Hackathon {
  slug: string;
  title: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  tags: string[];
  thumbnailUrl: string;
  period: HackathonPeriod;
  links: HackathonLinks;
}

// ============ Hackathon Detail Types ============
export interface TeamPolicy {
  allowSolo: boolean;
  maxTeamSize: number;
}

export interface EvalScoreBreakdown {
  key: string;
  label: string;
  weightPercent: number;
}

export interface Milestone {
  name: string;
  at: string;
}

export interface PrizeItem {
  place: string;
  amountKRW: number;
}

export interface SubmissionItem {
  key: string;
  title: string;
  format: string;
}

export interface HackathonSections {
  overview: {
    summary: string;
    teamPolicy: TeamPolicy;
  };
  info: {
    notice: string[];
    links: { rules: string; faq: string };
  };
  eval: {
    metricName: string;
    description: string;
    scoreSource?: string;
    scoreDisplay?: {
      label: string;
      breakdown: EvalScoreBreakdown[];
    };
    limits?: {
      maxRuntimeSec: number;
      maxSubmissionsPerDay: number;
    };
  };
  schedule: {
    timezone: string;
    milestones: Milestone[];
  };
  prize?: {
    items: PrizeItem[];
  };
  teams: {
    campEnabled: boolean;
    listUrl: string;
  };
  submit: {
    allowedArtifactTypes: string[];
    submissionUrl: string;
    guide: string[];
    submissionItems?: SubmissionItem[];
  };
  leaderboard: {
    publicLeaderboardUrl: string;
    note: string;
  };
}

export interface HackathonDetail {
  slug: string;
  title: string;
  sections: HackathonSections;
  extraDetails?: HackathonDetail[];
}

// ============ Team Types ============
export interface Team {
  teamCode: string;
  hackathonSlug: string;
  name: string;
  isOpen: boolean;
  memberCount: number;
  lookingFor: string[];
  intro: string;
  contact: {
    type: string;
    url: string;
  };
  createdAt: string;
}

// ============ Leaderboard Types ============
export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown?: {
    participant: number;
    judge: number;
  };
  artifacts?: {
    webUrl: string;
    pdfUrl: string;
    planTitle: string;
  };
}

export interface Leaderboard {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
  extraLeaderboards?: Leaderboard[];
}

// ============ User & Economy Types ============
export interface User {
  id: string;
  nickname: string;
  vibePoints: number;
  teamCode: string | null;
  investments: Investment[];
  createdAt: string;
}

export interface Investment {
  id: string;
  teamCode: string;
  teamName: string;
  amount: number;
  odds: number;
  settled: boolean;
  payout: number;
  createdAt: string;
}

// ============ Prompt Workspace Types ============
export interface PromptVariable {
  name: string;
  placeholder: string;
}

export interface PromptTemplate {
  id: string;
  teamCode: string;
  title: string;
  content: string;
  variables: PromptVariable[];
  version: string;
  previousVersionId: string | null;
  authorNickname: string;
  createdAt: string;
}

// ============ Market Types ============
export interface MarketItem {
  id: string;
  sellerTeamCode: string;
  sellerTeamName: string;
  title: string;
  description: string;
  promptContent: string;
  category: 'prompt' | 'component' | 'template';
  price: number;
  sold: boolean;
  buyerTeamCode: string | null;
  createdAt: string;
}

// ============ Arena Types ============
export interface ArenaMatch {
  id: string;
  teamACode: string;
  teamBCode: string;
  teamAName: string;
  teamBName: string;
  teamADescription: string;
  teamBDescription: string;
  winner: string | null;
  voterId: string | null;
  createdAt: string;
}

export interface ArenaTeamRating {
  teamCode: string;
  teamName: string;
  elo: number;
  wins: number;
  losses: number;
}

// ============ Section Restoration State ============
export type SectionKey = 'overview' | 'info' | 'eval' | 'schedule' | 'prize' | 'teams' | 'submit' | 'leaderboard';

export interface RestorationState {
  [slug: string]: {
    [key in SectionKey]?: boolean;
  };
}

// ============ Timelapse Types ============
export interface TimelapseStep {
  version: string;
  prompt: string;
  description: string;
  screenshotUrl?: string;
  timestamp: string;
}

export interface TimelapseHistory {
  teamCode: string;
  teamName: string;
  steps: TimelapseStep[];
}

// ============ Save Slot Types ============
export type SlotNumber = 1 | 2 | 3;

// ============ Rankings Types ============
export interface RankingEntry {
  userId: string;
  nickname: string;
  totalPoints: number;
  investmentReturns: number;
  tradingProfit: number;
  rank: number;
}
