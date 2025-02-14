export type LeaderboardRow = {
    rank: number;
    name: string;
    username: string;
    xp: number;
    avatar: string;
    achievements: string;
};

export type LeaderboardState = {
    userXp: LeaderboardRow[]
};