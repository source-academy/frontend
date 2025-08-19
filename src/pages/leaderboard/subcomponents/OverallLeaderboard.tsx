import 'src/styles/Leaderboard.scss';

import { ColDef, IDatasource, themeAlpine } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import default_avatar from 'src/assets/default-avatar.jpg';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';
import {
  LeaderboardContestDetails,
  LeaderboardRow
} from 'src/features/leaderboard/LeaderboardTypes';

import leaderboard_background from '../../../assets/leaderboard_background.jpg';
import LeaderboardDropdown from './LeaderboardDropdown';
import LeaderboardExportButton from './LeaderboardExportButton';
import LeaderboardPodium from './LeaderboardPodium';

const OverallLeaderboard: React.FC = () => {
  const dispatch = useDispatch();

  // Retrieve contests (For dropdown)
  const contestDetails: LeaderboardContestDetails[] = useTypedSelector(
    store => store.leaderboard.contests
  );

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
      {
        field: 'xp',
        suppressMovable: true,
        headerName: 'XP',
        width: 414 /*154*/,
        sortable: true
      }
    ],
    []
  );

  const paginatedLeaderboard: { rows: LeaderboardRow[]; userCount: number } = useTypedSelector(
    store => store.leaderboard.paginatedUserXp
  );
  const pageSize = 25;
  const visibleEntries = useTypedSelector(
    store => store.session?.topLeaderboardDisplay ?? Number.MAX_SAFE_INTEGER
  );
  const [top3Leaderboard, setTop3Leaderboard] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    dispatch(LeaderboardActions.getOverallLeaderboardXP(1, pageSize));
  }, [dispatch]);

  const latestParamsRef = useRef<any>(null);
  const dataSourceRef = useRef<IDatasource>({
    getRows: async (params: any) => {
      const startRow = params.startRow;
      const endRow = params.endRow;

      const pageSize = endRow - startRow;
      const page = startRow / pageSize + 1;

      dispatch(LeaderboardActions.getOverallLeaderboardXP(page, pageSize));

      // Params stored to prevent re-rendering
      latestParamsRef.current = params;
    }
  });

  useEffect(() => {
    if (latestParamsRef.current && paginatedLeaderboard.rows.length > 0) {
      const { successCallback } = latestParamsRef.current;

      if (latestParamsRef.current.startRow === 0) {
        setTop3Leaderboard(paginatedLeaderboard.rows.slice(0, 3));
      }

      successCallback(
        paginatedLeaderboard.rows,
        Math.min(paginatedLeaderboard.userCount, visibleEntries)
      );
      latestParamsRef.current = null;
    }
  }, [paginatedLeaderboard]);

  // Set sample profile pictures (Seeded random)
  function convertToRandomNumber(id: string): number {
    const str = id.slice(1);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    return (Math.abs(hash) % 7) + 1;
  }

  paginatedLeaderboard.rows.map((row: LeaderboardRow) => {
    row.avatar = `/assets/Sample_Profile_${convertToRandomNumber(row.username)}.jpg`;
  });

  return (
    <div className="leaderboard-container">
      {/* Top 3 Ranking */}
      <LeaderboardPodium type="overall" data={top3Leaderboard} outputType={undefined} />

      <div className="buttons-container">
        {/* Leaderboard Options Dropdown */}
        <LeaderboardDropdown contests={contestDetails} />

        {/* Export Button */}
        <LeaderboardExportButton type="overall" />
      </div>

      {/* Leaderboard Table (Replaced with ag-Grid) */}
      <div>
        <AgGridReact
          theme={themeAlpine}
          pagination={true}
          paginationPageSizeSelector={false}
          columnDefs={columnDefs}
          rowModelType="infinite"
          paginationPageSize={pageSize}
          domLayout="autoHeight"
          rowHeight={60}
          cacheBlockSize={pageSize}
          maxBlocksInCache={5}
          datasource={dataSourceRef.current}
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
