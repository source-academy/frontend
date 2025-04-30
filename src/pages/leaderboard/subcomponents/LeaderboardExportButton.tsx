import 'src/styles/Leaderboard.scss';

import React, { useEffect, useState } from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { ContestLeaderboardRow, LeaderboardRow } from 'src/features/leaderboard/LeaderboardTypes';

import { Role } from '../../../commons/application/ApplicationTypes';
import { useDispatch } from 'react-redux';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';

type Props = {
  type: string
  contest?: string
  contestID?: number
}

const LeaderboardExportButton: React.FC<Props> = ({ type, contest, contestID }) => {
  
  // Retrieve relevant leaderboard data
  const [ exportRequested, setExportRequest ] = useState(false);
  const dispatch = useDispatch();
  const data = (type == "overall")
               ? useTypedSelector(store => store.leaderboard.userXp)
               : (type == "score")
               ? useTypedSelector(store => store.leaderboard.contestScore)
               : useTypedSelector(store => store.leaderboard.contestPopularVote);

  const visibleEntries = useTypedSelector(store => store.session?.topContestLeaderboardDisplay ?? 10);

  const onExportClick = () => {
    // Dispatch relevant request
    if (type == "overall") dispatch(LeaderboardActions.getAllUsersXp());
    else if (type == "score") dispatch(LeaderboardActions.getAllContestScores(contestID as number, visibleEntries));
    else dispatch(LeaderboardActions.getAllContestPopularVotes(contestID as number, visibleEntries));
    setExportRequest(true)
  }

  // Return the CSV when requested and data is loaded
  useEffect(() => {
    if (exportRequested) {
      exportCSV();
      setExportRequest(false); // Clear request
    }
  }, [data])

  const role = useTypedSelector(store => store.session.role);
  const exportCSV = () => {
    const headers = [
      'Rank',
      'Name',
      'Username',
      type === 'overall' ? 'XP' : 'Score',
      type === 'overall' ? 'Achievements' : 'Submission Id'
    ];
    const rows = data?.map(player => [
      player.rank,
      player.name,
      player.username,
      type === 'overall' ? (player as LeaderboardRow).xp : (player as ContestLeaderboardRow).score,
      type === 'overall'
        ? (player as LeaderboardRow).achievements
        : (player as ContestLeaderboardRow).submissionId
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

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
