import { Button as BpButton, Card } from '@blueprintjs/core';
import { useNavigate } from 'react-router';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { useSession } from 'src/commons/utils/Hooks';
import { TeamFormationOverview } from 'src/features/teamFormation/TeamFormationTypes';

import TeamFormationTable from './TeamFormationTable';

type TeamFormationDashboardProps = {
  teams: TeamFormationOverview[];
};

const TeamFormationDashboard: React.FC<TeamFormationDashboardProps> = ({ teams }) => {
  const { courseId, group } = useSession();
  const navigate = useNavigate();

  const createTeam = () => {
    navigate(`/courses/${courseId}/teamformation/create`);
  };

  const importTeam = () => {
    navigate(`/courses/${courseId}/teamformation/import`);
  };

  const teamData = teams;
  return (
    <Card>
      <GradingFlex
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: '1rem' }}
      >
        <GradingText style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0 }}>Teams</GradingText>
        <GradingFlex justifyContent="flex-end" style={{ columnGap: '0.5rem' }}>
          <BpButton onClick={createTeam}>Create Team</BpButton>
          <BpButton onClick={importTeam}>Import Team</BpButton>
        </GradingFlex>
      </GradingFlex>
      <TeamFormationTable group={group} teams={teamData} />
    </Card>
  );
};

export default TeamFormationDashboard;
