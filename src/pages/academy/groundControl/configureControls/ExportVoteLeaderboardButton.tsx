import { IconNames } from '@blueprintjs/icons';
import ControlButton from 'src/commons/ControlButton';

type Props = {
  assessmentId: number;
};

const ExportVoteLeaderboardButton: React.FC<Props> = ({ assessmentId }) => {
  const exportPopularVoteLeaderboardToCsv = async () => {
    const popularVoteLeaderboard = await handleFetchPopularVoteLeaderboard(data.id);
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
