import { Button, Card } from '@blueprintjs/core';
import { useNavigate } from 'react-router';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { useSession } from 'src/commons/utils/Hooks';
import type { TeamFormationOverview } from 'src/features/teamFormation/TeamFormationTypes';

import TeamFormationTable from './TeamFormationTable';

type Props = {
  teams: TeamFormationOverview[];
};

const TeamFormationDashboard: React.FC<Props> = ({ teams }) => {
  const { group } = useSession();
  const navigate = useNavigate();

  return (
    <Card>
      <GradingFlex
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: '1rem' }}
      >
        <GradingText style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0 }}>Teams</GradingText>
        <GradingFlex justifyContent="flex-end" style={{ columnGap: '0.5rem' }}>
          <Button onClick={() => navigate('create')}>Create Team</Button>
          <Button onClick={() => navigate('import')}>Import Team</Button>
        </GradingFlex>
      </GradingFlex>
      <TeamFormationTable group={group} teams={teams} />
    </Card>
  );
};

export default TeamFormationDashboard;
