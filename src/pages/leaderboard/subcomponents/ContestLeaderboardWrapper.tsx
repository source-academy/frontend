import React from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { LeaderboardContestDetails } from "src/features/leaderboard/LeaderboardTypes";

import ContestLeaderboard from './ContestLeaderboard';
import NotFound from '../../notFound/NotFound';

const ContestLeaderboardWrapper: React.FC = () => {
  const enableContestLeaderboard = useTypedSelector(store => store.session.enableContestLeaderboard);
  const contestAssessments = useTypedSelector(store => store.session.assessmentOverviews);
  const defaultContest = 
    contestAssessments
    ?.find((assessment) => assessment.type == "Contests" && assessment.isPublished) ?? null;
  const contestDetails: LeaderboardContestDetails[] = 
    (contestAssessments ?? [])
    .filter(assessment => assessment.type === "Contests")
    .map(contest => ({
      contest_id: contest.id,
      title: contest.title,
      published: contest.isPublished
    }));
  
  const courseId = useTypedSelector(store => store.session.courseId);
  const baseLink = `/courses/${courseId}/leaderboard`;


  return (
    <Routes>
      <Route path="/:id/score" element={
        enableContestLeaderboard
        ? <ContestLeaderboardWrapperHelper baseLink={baseLink} contestDetails={contestDetails} type="score" />
        : <NotFound />
      }></Route>

      <Route path="/:id/popularvote" element={
        enableContestLeaderboard
        ? <ContestLeaderboardWrapperHelper baseLink={baseLink} contestDetails={contestDetails} type="popularvote" />
        : <NotFound />
      }></Route>

      <Route path="/" element={
        enableContestLeaderboard && defaultContest != null
        ? <Navigate to={`${baseLink}/contests/${defaultContest.id}/score`}/>
        : <Navigate to={baseLink} />
      }></Route>

      <Route path="*" element={ <Navigate to={baseLink} /> }></Route>
    </Routes>
  );
};

const ContestLeaderboardWrapperHelper: React.FC<{ baseLink: string; contestDetails: LeaderboardContestDetails[]; type: "score" | "popularvote" }> = ({ baseLink, contestDetails, type }) => {
  let { id } = useParams<{ id: string }>();
  const location = useLocation();

  if (!id) {
    const match = location.pathname.match(/\/contests\/(\d+)\//);
    if (match) {
      id = match[1];
    }
  }

  if (!contestDetails.length) { // Wait for contestDetails to load
    return null;
  }
  const contest = contestDetails.find(contest => contest.contest_id === parseInt(id ?? "", 10));

  return contest && contest.published ? <ContestLeaderboard type={type} contestID={contest.contest_id} /> : <Navigate to={baseLink} />;
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = ContestLeaderboardWrapper;
Component.displayName = 'ContestLeaderboardWrapper';

export default ContestLeaderboardWrapper;