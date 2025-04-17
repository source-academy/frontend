export type LeaderboardRow = {
  rank: number;
  name: string;
  username: string;
  xp: number;
  avatar: string;
  achievements: string;
};

export type ContestLeaderboardRow = {
  rank: number;
  name: string;
  username: string;
  score: number;
  avatar: string;
  code: string;
  submissionId: number;
  votingId: number;
};

export type LeaderboardState = {
  userXp: LeaderboardRow[];
  contestScore: ContestLeaderboardRow[];
  contestPopularVote: ContestLeaderboardRow[];
  code: string;
  contests: LeaderboardContestDetails[];
  initialRun: { [id: number]: boolean };
};

export type LeaderboardContestDetails = {
  contest_id: number;
  title: string;
  published: boolean | undefined;
};
