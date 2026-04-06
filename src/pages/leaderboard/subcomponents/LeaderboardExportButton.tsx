import 'src/styles/Leaderboard.scss';

import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import {
  getAllOverallLeaderboardXP,
  getContestPopularVoteLeaderboard,
  getContestScoreLeaderboard
} from 'src/commons/sagas/RequestsSaga';
import { useSession } from 'src/commons/utils/Hooks';
import { ContestLeaderboardRow, LeaderboardRow } from 'src/features/leaderboard/LeaderboardTypes';

type Props = {
  type: string;
  contest?: string;
  contestID?: number;
};

const LeaderboardExportButton: React.FC<Props> = ({ type, contest, contestID }) => {
  const { role, accessToken, refreshToken } = useSession();

  const onExportClick = async () => {
    const tokens = { accessToken: accessToken!, refreshToken: refreshToken! };

    if (type === 'overall') {
      const resp = await getAllOverallLeaderboardXP(tokens);
      if (resp) {
        exportCSV(resp);
      }
    } else if (type === 'score') {
      const resp = await getContestScoreLeaderboard(contestID!, Number.MAX_SAFE_INTEGER, tokens);
      if (resp) {
        exportCSV(resp);
      }
    } else if (type === 'popularvote') {
      const resp = await getContestPopularVoteLeaderboard(
        contestID!,
        Number.MAX_SAFE_INTEGER,
        tokens
      );
      if (resp) {
        exportCSV(resp);
      }
    }
  };

  const escapeCodeField = (value: any) => {
    const str = value?.toString() ?? '';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const exportCSV = (data: any[]) => {
    const headers = [
      'Rank',
      'Name',
      'Username',
      type === 'overall' ? 'XP' : 'Score',
      type === 'overall' ? 'Achievements' : 'Code'
    ];
    const rows = data.map(
      (player: {
        rank: any;
        name: any;
        username: any;
        xp?: number;
        avatar?: string;
        achievements?: string;
        score?: number;
        code?: string;
        submissionId?: number;
        votingId?: number;
      }) => [
        player.rank,
        player.name,
        player.username,
        type === 'overall'
          ? (player as LeaderboardRow).xp
          : (player as ContestLeaderboardRow).score,
        type === 'overall'
          ? (player as LeaderboardRow).achievements
          : escapeCodeField((player as ContestLeaderboardRow).code)
      ]
    );

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download =
      type === 'overall'
        ? 'Overall Leaderboard.csv'
        : type === 'popularvote'
          ? `${contest} Popular Vote Leaderboard.csv`
          : `${contest} Score Leaderboard.csv`; // Filename for download
    link.click();
  };

  return role === Role.Admin || role === Role.Staff ? (
    <button onClick={onExportClick} className="export-button">
      Export as CSV
    </button>
  ) : (
    ''
  );
};

export default LeaderboardExportButton;
