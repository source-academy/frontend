import 'src/styles/Leaderboard.scss';

import React from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { ContestLeaderboardRow, LeaderboardRow } from 'src/features/leaderboard/LeaderboardTypes'; 

import { Role } from '../../../commons/application/ApplicationTypes';

type Props =
  | { type: "contest"; contest: string | undefined; data: ContestLeaderboardRow[] }
  | { type: "overall"; contest: string | undefined; data: LeaderboardRow[] };

const LeaderboardExportButton: React.FC<Props> = ({ type, contest, data }) => {
  const role = useTypedSelector(store => store.session.role);
  const exportCSV = () => {
    const headers = ['Rank', 'Name', 'Username', (type === "overall" ? 'XP' : 'Score'), (type === "overall" ? 'Achievements' : 'Submission Id')];
    const rows = data?.map(player => [
        player.rank,
        player.name,
        player.username,
        type === "overall" ? (player as LeaderboardRow).xp : (player as ContestLeaderboardRow).score,
        type === "overall" ? (player as LeaderboardRow).achievements : (player as ContestLeaderboardRow).submissionId
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = type === "overall" ? 'Overall Leaderboard.csv' : `${contest} Leaderboard.csv`; // Filename for download
    link.click();
  };

  return role === Role.Admin || role === Role.Staff ? (
    <button onClick={exportCSV} className="export-button">
      Export as .csv
    </button>
  ) : (
    ''
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LeaderboardExportButton;
Component.displayName = 'LeaderboardExportButton';

export default LeaderboardExportButton;
