import '@tremor/react/dist/esm/tremor.css';

import { Button, Card, Col, ColGrid, Flex, Title } from '@tremor/react';
import { useNavigate } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { TeamFormationOverview } from 'src/features/teamFormation/TeamFormationTypes';

import TeamFormationTable from './TeamFormationTable';

type TeamFormationDashboardProps = {
  teams: TeamFormationOverview[];
};

const TeamFormationDashboard: React.FC<TeamFormationDashboardProps> = ({ teams }) => {
  const group = useTypedSelector(state => state.session.group);
  const { courseId } = useTypedSelector(state => state.session);
  const navigate = useNavigate();

  const createTeam = () => {
    navigate(`/courses/${courseId}/teamformation/create`);
  };

  const importTeam = () => {
    navigate(`/courses/${courseId}/teamformation/import`);
  };

  const teamData = teams;
  return (
    <ColGrid numColsLg={8} gapX="gap-x-4" gapY="gap-y-2">
      <Col numColSpanLg={8}>
        <Card>
          <Flex justifyContent="justify-between">
            <Flex justifyContent="justify-start" spaceX="space-x-6">
              <Title>Teams</Title>
            </Flex>
            <Button onClick={createTeam}>Create Team</Button>
            &nbsp;
            <Button onClick={importTeam}>Import Team</Button>
          </Flex>
          <TeamFormationTable group={group} teams={teamData} />
        </Card>
      </Col>
    </ColGrid>
  );
};

export default TeamFormationDashboard;
