import type { LeaderboardEntry, LeaderboardCategory } from '../types';

export const generateFakeLeaderboardData = (
  playerName: string,
  playerStats: { points: number; totalClicks: number; gems: number },
  category: LeaderboardCategory
): LeaderboardEntry[] => {
  const playerScore = playerStats[category];

  // The leaderboard now only shows the current player.
  return [
    {
      rank: 1,
      name: playerName,
      score: playerScore,
      isPlayer: true,
    },
  ];
};
