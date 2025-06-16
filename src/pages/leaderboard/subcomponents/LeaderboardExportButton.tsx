import 'src/styles/Leaderboard.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';
import { ContestLeaderboardRow, LeaderboardRow } from 'src/features/leaderboard/LeaderboardTypes';

import { Role } from '../../../commons/application/ApplicationTypes';

type Props = {
  type: string;
  contest?: string;
  contestID?: number;
};

const LeaderboardExportButton: React.FC<Props> = ({ type, contest, contestID }) => {
  // Retrieve relevant leaderboard data
  const [exportRequested, setExportRequest] = useState(false);
  const dispatch = useDispatch();
  const selectData = (type: string) => {
    switch (type) {
      case 'overall':
        return (store: { leaderboard: { userXp: any } }) => store.leaderboard.userXp;
      case 'score':
        return (store: { leaderboard: { contestScore: any } }) => store.leaderboard.contestScore;
      default:
        return (store: { leaderboard: { contestPopularVote: any } }) =>
          store.leaderboard.contestPopularVote;
    }
  };

  const selector = useMemo(() => selectData(type), [type]);
  const data = useTypedSelector(selector);

  const visibleEntries = Number.MAX_SAFE_INTEGER;

  const onExportClick = () => {
    // Dispatch relevant request
    if (type == 'overall') dispatch(LeaderboardActions.getAllUsersXp());
    else if (type == 'score')
      dispatch(LeaderboardActions.getAllContestScores(contestID as number, visibleEntries));
    else
      dispatch(LeaderboardActions.getAllContestPopularVotes(contestID as number, visibleEntries));
    setExportRequest(true);
  };

  // Return the CSV when requested and data is loaded
  useEffect(() => {
    if (exportRequested) {
      exportCSV();
      setExportRequest(false); // Clear request
    }
  }, [data]);

  const escapeCodeField = (value: any) => {
    const str = value?.toString() ?? '';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const role = useTypedSelector(store => store.session.role);
  const exportCSV = () => {
    const headers = [
      'Rank',
      'Name',
      'Username',
      type === 'overall' ? 'XP' : 'Score',
      type === 'overall' ? 'Achievements' : 'Code'
    ];
    const rows = data?.map(
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
