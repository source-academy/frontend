import { NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import React from 'react';
import { useSession } from 'src/commons/utils/Hooks';

import ContentDisplay from '../../../commons/ContentDisplay';
import TeamFormationDashboard from './subcomponents/TeamFormationDashboard';

const TeamFormation: React.FC = () => {
  const { teamFormationOverviews } = useSession();
  const data =
    teamFormationOverviews?.map(e =>
      !e.studentNames ? { ...e, studentName: '(user has yet to log in)' } : e
    ) ?? [];
  /* Display either a loading screen or a table with overviews. */
  const loadingDisplay = (
    <NonIdealState
      className="TeamFormation"
      description="Fetching teams..."
      icon={<Spinner size={SpinnerSize.LARGE} />}
    />
  );

  return (
    <ContentDisplay
      display={
        teamFormationOverviews === undefined ? (
          loadingDisplay
        ) : (
          <TeamFormationDashboard teams={data} />
        )
      }
      fullWidth={true}
    />
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = TeamFormation;
Component.displayName = 'TeamFormation';

export default TeamFormation;
