import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'src/styles/Leaderboard.scss';

import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';
import {
  LeaderboardContestDetails,
  LeaderboardRow
} from 'src/features/leaderboard/LeaderboardTypes';

import default_avatar from '../../../assets/default-avatar.jpg';
import leaderboard_background from '../../../assets/leaderboard_background.jpg';
import LeaderboardDropdown from './LeaderboardDropdown';
import LeaderboardExportButton from './LeaderboardExportButton';
import LeaderboardPodium from './LeaderboardPodium';

const OverallLeaderboard: React.FC = () => {
  // Retrieve XP Data from store
  const rankedLeaderboard: LeaderboardRow[] = useTypedSelector(store => store.leaderboard.userXp);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(LeaderboardActions.getAllUsersXp());
  }, [dispatch]);

  // Retrieve contests (For dropdown)
  const contestAssessments = useTypedSelector(store => store.session.assessmentOverviews);

  const contestDetails: LeaderboardContestDetails[] = (contestAssessments ?? [])
    .filter(assessment => assessment.type === 'Contests')
    .map(contest => ({
      contest_id: contest.id,
      title: contest.title,
      published: contest.isPublished,
      voting: contest.hasVotingFeatures
    }));

  // Temporary loading of leaderboard background
  useEffect(() => {
    const originalBackground = document.body.style.background;
    document.body.style.background = `url(${leaderboard_background}) center/cover no-repeat fixed`;
    return () => {
      // Cleanup
      document.body.style.background = originalBackground;
    };
  }, []);

  // Display constants
  const visibleEntries = useTypedSelector(store => store.session.topLeaderboardDisplay);
  const topX = rankedLeaderboard.filter(x => x.rank <= Number(visibleEntries));

  // Define column definitions for ag-Grid
  const columnDefs: ColDef<LeaderboardRow>[] = useMemo(
    () => [
      {
        field: 'rank',
        suppressMovable: true,
        headerName: 'Rank',
        width: 84,
        sortable: true,
        cellRenderer: (params: any) => {
          const rank = params.value;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
          return `${rank} ${medal}`;
        }
      },
      {
        field: 'avatar',
        suppressMovable: true,
        headerName: 'Avatar',
        width: 180,
        sortable: false,
        cellRenderer: (params: any) => (
          <img
            src={params.value}
            alt="avatar"
            className="avatar"
            onError={e => (e.currentTarget.src = default_avatar)}
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          />
        )
      },
      { field: 'name', suppressMovable: true, headerName: 'Name', width: 520, sortable: true },
      { field: 'xp', suppressMovable: true, headerName: 'XP', width: 154, sortable: true },
      {
        field: 'achievements',
        suppressMovable: true,
        sortable: false,
        headerName: 'Achievements',
        width: 260
      }
    ],
    []
  );

  return (
    <div className="leaderboard-container">
      {/* Top 3 Ranking */}
      <LeaderboardPodium type="overall" data={rankedLeaderboard} outputType={undefined}/>

      <div className="buttons-container">
        {/* Leaderboard Options Dropdown */}
        <LeaderboardDropdown contests={contestDetails} />

        {/* Export Button */}
        <LeaderboardExportButton type="overall" contest={undefined} data={rankedLeaderboard} />
      </div>

      {/* Leaderboard Table (Replaced with ag-Grid) */}
      <div className="ag-theme-alpine">
        <AgGridReact
          rowData={topX}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[25, 50, 100]}
          domLayout="autoHeight"
          rowHeight={60}
        />
      </div>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = OverallLeaderboard;
Component.displayName = 'OverallLeaderboard';

export default OverallLeaderboard;
