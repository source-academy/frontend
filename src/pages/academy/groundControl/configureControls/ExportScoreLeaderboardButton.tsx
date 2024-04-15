import { IconNames } from '@blueprintjs/icons';
import { createGrid, GridOptions } from 'ag-grid-community';
import ControlButton from 'src/commons/ControlButton';
import { getScoreLeaderboard } from 'src/commons/sagas/RequestsSaga';
import { useTokens } from 'src/commons/utils/Hooks';

type Props = {
  assessmentId: number;
};

const ExportScoreLeaderboardButton: React.FC<Props> = ({ assessmentId }) => {
  const tokens = useTokens();

  // onClick handler for fetching score leaderboard, putting it into a grid and exporting data
  const exportScoreLeaderboardToCsv = async () => {
    const scoreLeaderbaord = await getScoreLeaderboard(assessmentId, tokens);
    const gridContainer = document.createElement('div');
    const gridOptions: GridOptions = {
      rowData: scoreLeaderbaord,
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
        onClick={exportScoreLeaderboardToCsv}
        label="Export Score Leaderboard"
      />
    </div>
  );
};

export default ExportScoreLeaderboardButton;
