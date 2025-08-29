
import type { Generator, Upgrade } from './types';

export const INITIAL_GENERATORS: Generator[] = [
  { id: 'cursor', name: 'Cursor', emoji: '👆', baseCost: 15, basePps: 0.1, level: 0, costMultiplier: 1.15 },
  { id: 'grandma', name: 'Grandma', emoji: '🍪', baseCost: 100, basePps: 1, level: 0, costMultiplier: 1.15 },
  { id: 'farm', name: 'Farm', emoji: '🚜', baseCost: 1100, basePps: 8, level: 0, costMultiplier: 1.15 },
  { id: 'factory', name: 'Factory', emoji: '🏭', baseCost: 12000, basePps: 47, level: 0, costMultiplier: 1.15 },
  { id: 'bank', name: 'Bank', emoji: '💰', baseCost: 130000, basePps: 260, level: 0, costMultiplier: 1.15 },
  { id: 'temple', name: 'Temple', emoji: '🏛️', baseCost: 1400000, basePps: 1400, level: 0, costMultiplier: 1.15 },
  { id: 'wizard', name: 'Wizard Tower', emoji: '🧙‍♂️', baseCost: 20000000, basePps: 7800, level: 0, costMultiplier: 1.15 },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', baseCost: 330000000, basePps: 44000, level: 0, costMultiplier: 1.15 },
  { id: 'planet', name: 'Planet', emoji: '🪐', baseCost: 5100000000, basePps: 260000, level: 0, costMultiplier: 1.15 },
];

export const INITIAL_UPGRADES: Upgrade[] = [
  { id: 'click1', name: 'Reinforced Finger', description: 'Doubles your click power.', cost: 100, multiplier: 2, target: 'click', purchased: false },
  { id: 'cursor1', name: 'Ergonomic Mouse', description: 'Cursors are twice as efficient.', cost: 500, multiplier: 2, target: 'cursor', purchased: false },
  { id: 'grandma1', name: 'Better Ovens', description: 'Grandmas are twice as efficient.', cost: 1000, multiplier: 2, target: 'grandma', purchased: false },
  { id: 'click2', name: 'Titanium Finger', description: 'Doubles your click power again!', cost: 2500, multiplier: 2, target: 'click', purchased: false },
  { id: 'farm1', name: 'Advanced Fertilizers', description: 'Farms are twice as efficient.', cost: 10000, multiplier: 2, target: 'farm', purchased: false },
  { id: 'cursor2', name: 'Ambidextrous Cursors', description: 'Cursors are twice as efficient again.', cost: 10000, multiplier: 2, target: 'cursor', purchased: false },
  { id: 'grandma2', name: 'Rolling Pins', description: 'Grandmas are twice as efficient again.', cost: 25000, multiplier: 2, target: 'grandma', purchased: false },
  { id: 'factory1', name: 'Automation', description: 'Factories are twice as efficient.', cost: 120000, multiplier: 2, target: 'factory', purchased: false },
  { id: 'click3', name: 'Diamond Finger', description: 'Your click power is now 5x stronger.', cost: 500000, multiplier: 5, target: 'click', purchased: false },
  { id: 'bank1', name: 'Crypto Investments', description: 'Banks are twice as efficient.', cost: 1300000, multiplier: 2, target: 'bank', purchased: false },
  { id: 'temple1', name: 'Divine Prayers', description: 'Temples are twice as efficient.', cost: 1.4e7, multiplier: 2, target: 'temple', purchased: false },
  { id: 'wizard1', name: 'Ancient Grimoires', description: 'Wizard Towers are twice as efficient.', cost: 2e8, multiplier: 2, target: 'wizard', purchased: false },
  { id: 'rocket1', name: 'Fuel Boosters', description: 'Rockets are twice as efficient.', cost: 3.3e9, multiplier: 2, target: 'rocket', purchased: false },
  { id: 'planet1', name: 'Terraforming', description: 'Planets are twice as efficient.', cost: 5.1e10, multiplier: 2, target: 'planet', purchased: false },
];

export const REBIRTH_COST = 1e12; // 1 Trillion
export const POINTS_PER_GEM = 1e12; // Each gem requires another 1 Trillion

export const PRESTIGE_COST_BASE = 10;
export const PRESTIGE_COST_SCALING = 10; // cost = base + level * scaling
export const PRESTIGE_BONUS_PER_LEVEL = 0.5; // +50% per level