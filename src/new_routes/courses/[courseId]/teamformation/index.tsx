import { NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { useSession } from 'src/commons/utils/Hooks';

import ContentDisplay from '../../../../commons/ContentDisplay';
import TeamFormationDashboard from '../../../../pages/academy/teamFormation/subcomponents/TeamFormationDashboard';

function TeamFormation() {
  const { teamFormationOverviews } = useSession();
  const data =
    teamFormationOverviews?.map(e =>
      !e.studentNames ? { ...e, studentName: '(user has yet to log in)' } : e,
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
      fullWidth
    />
  );
}

export const Component = TeamFormation;
