import type { Achievement, GameState } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // Clicks
  { id: 'click_1', icon: '👆', goal: (s: GameState) => s.totalClicks >= 1 },
  { id: 'click_100', icon: '👆', goal: (s: GameState) => s.totalClicks >= 100 },
  { id: 'click_1k', icon: '👆', goal: (s: GameState) => s.totalClicks >= 1000 },
  { id: 'click_10k', icon: '👆', goal: (s: GameState) => s.totalClicks >= 10000 },

  // Points
  { id: 'points_1k', icon: '⭐', goal: (s: GameState) => s.points >= 1000 },
  { id: 'points_1m', icon: '⭐', goal: (s: GameState) => s.points >= 1e6 },
  { id: 'points_1b', icon: '⭐', goal: (s: GameState) => s.points >= 1e9 },
  { id: 'points_1t', icon: '⭐', goal: (s: GameState) => s.points >= 1e12 },

  // Generators
  { id: 'gen_buy_cursor', icon: '🖱️', goal: (s: GameState) => (s.generators.find(g => g.id === 'cursor')?.level ?? 0) > 0 },
  { id: 'gen_buy_grandma', icon: '🍪', goal: (s: GameState) => (s.generators.find(g => g.id === 'grandma')?.level ?? 0) > 0 },
  { id: 'gen_buy_all', icon: '🛠️', goal: (s: GameState) => s.generators.every(g => g.level > 0) },
  { id: 'gen_level_25', icon: '🔧', goal: (s: GameState) => s.generators.some(g => g.level >= 25) },
  { id: 'gen_level_100', icon: '🔩', goal: (s: GameState) => s.generators.some(g => g.level >= 100) },

  // Upgrades
  { id: 'upgrade_buy_1', icon: '🌟', goal: (s: GameState) => s.upgrades.some(u => u.purchased) },
  { id: 'upgrade_buy_5', icon: '🌟', goal: (s: GameState) => s.upgrades.filter(u => u.purchased).length >= 5 },
  { id: 'upgrade_buy_all', icon: '🌟', goal: (s: GameState) => s.upgrades.every(u => u.purchased) },
  
  // Rebirth
  { id: 'rebirth_1', icon: '💎', goal: (s: GameState) => s.gems >= 1 },
  { id: 'rebirth_5', icon: '💎', goal: (s: GameState) => s.gems >= 5 },
  { id: 'rebirth_10', icon: '💎', goal: (s: GameState) => s.gems >= 10 },
  
  // Click Level
  { id: 'click_level_10', icon: '💥', goal: (s: GameState) => s.clickLevel >= 10 },
  { id: 'click_level_25', icon: '💥', goal: (s: GameState) => s.clickLevel >= 25 },

  // Secret Achievements
  { id: 'secret_cheater', icon: '😈', goal: () => false, secret: true },
  { id: 'secret_completed', icon: '💯', goal: () => false, secret: true },
];