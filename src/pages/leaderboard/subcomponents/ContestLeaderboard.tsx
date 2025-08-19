import 'src/styles/Leaderboard.scss';

import { type ColDef, themeAlpine } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';
import {
  ContestLeaderboardRow,
  LeaderboardContestDetails
} from 'src/features/leaderboard/LeaderboardTypes';

import default_avatar from '../../../assets/default-avatar.jpg';
import leaderboard_background from '../../../assets/leaderboard_background.jpg';
import LeaderboardDropdown from './LeaderboardDropdown';
import LeaderboardExportButton from './LeaderboardExportButton';
import LeaderboardPodium from './LeaderboardPodium';
import { convertToRandomNumber } from './OverallLeaderboard';

type Props = {
  type: 'score' | 'popularvote';
  contest: LeaderboardContestDetails;
};

const ContestLeaderboard: React.FC<Props> = ({
  type,
  contest: { contest_id: contestId, title: contestName }
}) => {
  const courseID = useTypedSelector(store => store.session.courseId);
  const visibleEntries = useTypedSelector(
    store => store.session?.topContestLeaderboardDisplay ?? 10
  );
  const dispatch = useDispatch();

  // Retrieve Contest Score Data from store
  const rankedLeaderboard: ContestLeaderboardRow[] = useTypedSelector(store =>
    type === 'score' ? store.leaderboard.contestScore : store.leaderboard.contestPopularVote
  );

  useEffect(() => {
    if (type === 'score') {
      dispatch(LeaderboardActions.getAllContestScores(contestId, visibleEntries));
    } else {
      dispatch(LeaderboardActions.getAllContestPopularVotes(contestId, visibleEntries));
    }
  }, [dispatch, contestId, type]);

  useEffect(() => {
    dispatch(LeaderboardActions.getContests());
  }, [dispatch]);

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
  const top3 = rankedLeaderboard.filter(row => row.rank <= 3);
  const rest = rankedLeaderboard
    .filter(row => row.rank <= Number(visibleEntries))
    .slice(top3.length);

  rankedLeaderboard.map((row: ContestLeaderboardRow) => {
    row.avatar = `/assets/Sample_Profile_${convertToRandomNumber(row.username)}.jpg`;
  });

  // const workspaceLocation = 'assessment';
  const navigate = useNavigate();
  const handleLinkClick = (code: string, votingId: number) => {
    dispatch(LeaderboardActions.saveCode(code));
    navigate(`/courses/${courseID}/contests/${votingId}/0`);
  };

  // Define column definitions for ag-Grid
  const columnDefs: ColDef<ContestLeaderboardRow>[] = useMemo(
    () => [
      {
        field: 'rank',
        headerName: 'Rank',
        flex: 84,
        sortable: true,
        cellRenderer: (params: any) => {
          const rank = params.value;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
          return `${rank} ${medal}`;
        }
      },
      {
        field: 'avatar',
        headerName: 'Avatar',
        flex: 180,
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
      { field: 'name', headerName: 'Name', flex: 520, sortable: true },
      {
        field: 'score',
        headerName: 'Score',
        flex: 154,
        sortable: true,
        valueFormatter: params => params.value?.toFixed(2)
      },
      {
        field: 'code',
        headerName: 'Code',
        flex: 260,
        sortable: false,
        cellRenderer: (params: any) => (
          <a
            href="code"
            onClick={e => {
              e.preventDefault();
              handleLinkClick(params.data.code, params.data.votingId);
            }}
            style={{ color: 'white', fontStyle: 'italic' }}
          >
            🔗 Open Code
          </a>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="leaderboard-container">
      {/* Top 3 Ranking */}
      <LeaderboardPodium type="contest" data={rankedLeaderboard} outputType="image" />

      <div className="buttons-container">
        {/* Leaderboard Options Dropdown */}
        <LeaderboardDropdown />
        {/* Export Button */}
        <LeaderboardExportButton type={type} contest={contestName} contestID={contestId} />
      </div>

      {/* Leaderboard Table (Top 3) */}
      <div className="leaderboard-table-container">
        <h2>Contest Winners</h2>
        <AgGridReact
          theme={themeAlpine}
          rowData={top3}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          rowHeight={60}
          pagination={top3.length > 10}
          paginationPageSize={10}
          paginationPageSizeSelector={[10]}
        />
      </div>

      <div className="table-gap"></div>

      {/* Honourable Mentions */}
      <div className="leaderboard-table-container">
        <h2>Honourable Mentions</h2>
        <AgGridReact
          theme={themeAlpine}
          rowData={rest}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          rowHeight={60}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
        />
      </div>
    </div>
  );
};

export default ContestLeaderboard;
