import { IconNames } from '@blueprintjs/icons';
import { createGrid, GridOptions } from 'ag-grid-community';
import ControlButton from 'src/commons/ControlButton';
import { getPopularVoteLeaderboard } from 'src/commons/sagas/RequestsSaga';
import { useTokens } from 'src/commons/utils/Hooks';

type Props = {
  assessmentId: number;
};

const ExportVoteLeaderboardButton: React.FC<Props> = ({ assessmentId }) => {
  const tokens = useTokens({ throwWhenEmpty: true });

  // onClick handler for fetching popular vote leaderboard, putting it into a grid and exporting data
  const exportPopularVoteLeaderboardToCsv = async () => {
    const popularVoteLeaderboard = await getPopularVoteLeaderboard(assessmentId, tokens);
    const gridContainer = document.createElement('div');
    const gridOptions: GridOptions = {
      rowData: popularVoteLeaderboard,
      columnDefs: [{ field: 'student_name' }, { field: 'answer' }, { field: 'final_score' }]
    };
    const api = createGrid(gridContainer, gridOptions);
    api.exportDataAsCsv();
    api.destroy();
  };

  return (
    <div className="control-button-container">
      <ControlButton
        icon={IconNames.PEOPLE}
        onClick={exportPopularVoteLeaderboardToCsv}
        label="Export Popular Vote Leaderboard"
      />
    </div>
  );
};

export default ExportVoteLeaderboardButton;
