
export interface Generator {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  basePps: number;
  level: number;
  costMultiplier: number;
}

export interface Upgrade {
  id:string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  target: string; // 'click' or a generator id
  purchased: boolean;
}

export interface Achievement {
  id: string;
  icon: string;
  goal: (state: GameState) => boolean;
  secret?: boolean;
}

export interface GameState {
  points: number;
  gems: number;
  totalClicks: number;
  generators: Generator[];
  upgrades: Upgrade[];
  clickLevel: number;
  clickProgress: number;
  unlockedAchievements: { [key: string]: boolean };
  prestigeLevel: number;
}

export type LeaderboardCategory = 'points' | 'totalClicks' | 'gems';

export interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    isPlayer: boolean;
}

export interface Boost {
  multiplier: number;
  timeLeft: number;
}