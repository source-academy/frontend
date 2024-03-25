import '@tremor/react/dist/esm/tremor.css';

import { Button as BpButton } from '@blueprintjs/core';
import { Card, Flex, Title } from '@tremor/react';
import { useNavigate } from 'react-router';
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
      <Flex justifyContent="justify-between">
        <Title>Teams</Title>
        <Flex justifyContent="justify-end" spaceX="space-x-2">
          <BpButton onClick={createTeam}>Create Team</BpButton>
          <BpButton onClick={importTeam}>Import Team</BpButton>
        </Flex>
      </Flex>
      <TeamFormationTable group={group} teams={teamData} />
    </Card>
  );
};

export default TeamFormationDashboard;
