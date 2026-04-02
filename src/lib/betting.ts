import { Investment } from '@/types';

export function calculateOdds(totalPool: number, teamPool: number): number {
  if (teamPool === 0) return 10.0;
  return Math.max(1.1, totalPool / teamPool);
}

export function calculatePayout(investment: Investment, won: boolean): number {
  if (!won) return 0;
  return Math.round(investment.amount * investment.odds);
}

export function getTotalInvestmentPool(investments: Investment[]): number {
  return investments.reduce((sum, inv) => sum + inv.amount, 0);
}

export function getTeamInvestmentPool(investments: Investment[], teamCode: string): number {
  return investments
    .filter(inv => inv.teamCode === teamCode)
    .reduce((sum, inv) => sum + inv.amount, 0);
}
