import type { LeaderboardEntry, LeaderboardCategory } from '../types';

const LEADERBOARD_STORAGE_KEY = 'emojiClickerLeaderboardData';

type LeaderboardData = Record<string, {
    points: number;
    totalClicks: number;
    gems: number;
}>;

export const generateLeaderboardData = (
  currentPlayerName: string,
  category: LeaderboardCategory
): LeaderboardEntry[] => {
  let allPlayersData: LeaderboardData = {};
  try {
    const data = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    allPlayersData = data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to read leaderboard data", e);
    // Continue with empty data
  }

  const scoredPlayers = Object.entries(allPlayersData).map(([name, stats]) => ({
    name,
    score: stats[category] || 0,
  }));

  scoredPlayers.sort((a, b) => b.score - a.score);

  return scoredPlayers.map((player, index) => ({
    rank: index + 1,
    name: player.name,
    score: player.score,
    isPlayer: player.name === currentPlayerName,
  }));
};