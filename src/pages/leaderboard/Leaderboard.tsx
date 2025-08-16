import React from 'react';
import { Navigate, Route } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { SentryRoutes } from 'src/routes/routerConfig';

import NotFound from '../notFound/NotFound';
import OverallLeaderboardWrapper from './subcomponents/OverallLeaderboardWrapper';

const Leaderboard: React.FC = () => {
  const enableOverallLeaderboard = useTypedSelector(
    store => store.session.enableOverallLeaderboard
  );
  const enableContestLeaderboard = useTypedSelector(
    store => store.session.enableContestLeaderboard
  );
  const contestAssessments = useTypedSelector(store => store.session.assessmentOverviews);
  const defaultContest =
    contestAssessments?.find(
      assessment => assessment.type == 'Contests' && assessment.isPublished
    ) ?? null;

  const courseId = useTypedSelector(store => store.session.courseId);
  const baseLink = `/courses/${courseId}/leaderboard`;

  return (
    <SentryRoutes>
      <Route
        path="/"
        element={
          enableOverallLeaderboard ? (
            <OverallLeaderboardWrapper />
          ) : enableContestLeaderboard && defaultContest != null ? (
            <Navigate to={`${baseLink}/contests/${defaultContest.id}/score`} />
          ) : (
            <NotFound />
          )
        }
      ></Route>

      <Route
        path="*"
        element={
          enableOverallLeaderboard || enableContestLeaderboard ? (
            <Navigate to={baseLink} />
          ) : (
            <NotFound />
          )
        }
      ></Route>
    </SentryRoutes>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Leaderboard;
Component.displayName = 'Leaderboard';

export default Leaderboard;
