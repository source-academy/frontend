import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Route, useLocation, useParams } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';
import type { LeaderboardContestDetails } from 'src/features/leaderboard/LeaderboardTypes';
import { SentryRoutes } from 'src/routes/routerConfig';

import NotFound from '../../notFound/NotFound';
import ContestLeaderboard from './ContestLeaderboard';

const ContestLeaderboardWrapper: React.FC = () => {
  const enableContestLeaderboard = useTypedSelector(
    store => store.session.enableContestLeaderboard
  );

  const dispatch = useDispatch();
  const contestAssessments: LeaderboardContestDetails[] = useTypedSelector(
    store => store.leaderboard.contests
  );

  useEffect(() => {
    dispatch(LeaderboardActions.getContests());
  }, [dispatch]);

  const defaultContest = contestAssessments?.find(assessment => assessment.published) ?? null;

  const courseId = useTypedSelector(store => store.session.courseId);
  const baseLink = `/courses/${courseId}/leaderboard`;

  return (
    <SentryRoutes>
      <Route
        path="/:id/score"
        element={
          enableContestLeaderboard ? (
            <ContestLeaderboardWrapperHelper
              baseLink={baseLink}
              contestDetails={contestAssessments}
              type="score"
            />
          ) : (
            <NotFound />
          )
        }
      ></Route>

      <Route
        path="/:id/popularvote"
        element={
          enableContestLeaderboard ? (
            <ContestLeaderboardWrapperHelper
              baseLink={baseLink}
              contestDetails={contestAssessments}
              type="popularvote"
            />
          ) : (
            <NotFound />
          )
        }
      ></Route>

      <Route
        path="/"
        element={
          enableContestLeaderboard && defaultContest != null ? (
            <Navigate to={`${baseLink}/contests/${defaultContest.contest_id}/score`} />
          ) : (
            <Navigate to={baseLink} />
          )
        }
      ></Route>

      <Route path="*" element={<Navigate to={baseLink} />}></Route>
    </SentryRoutes>
  );
};

const ContestLeaderboardWrapperHelper: React.FC<{
  baseLink: string;
  contestDetails: LeaderboardContestDetails[];
  type: 'score' | 'popularvote';
}> = ({ baseLink, contestDetails, type }) => {
  let { id } = useParams<{ id: string }>();
  const location = useLocation();

  if (!id) {
    const match = location.pathname.match(/\/contests\/(\d+)\//);
    if (match) {
      id = match[1];
    }
  }

  if (!contestDetails.length) {
    // Wait for contestDetails to load
    return null;
  }
  const contest = contestDetails.find(contest => contest.contest_id === parseInt(id ?? '', 10));

  return contest !== undefined && contest.published ? (
    <ContestLeaderboard type={type} contestID={contest.contest_id} />
  ) : (
    <Navigate to={baseLink} />
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = ContestLeaderboardWrapper;
Component.displayName = 'ContestLeaderboardWrapper';

export default ContestLeaderboardWrapper;
