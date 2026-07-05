import { useParams } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import ContestLeaderboard from '../../../../../../pages/leaderboard/subcomponents/ContestLeaderboard';
import { Component as NotFound } from '../../../../../not-found';

function ContestLeaderboardWrapper() {
  const { contestId, leaderboardType: type } = useParams<{
    contestId: string;
    leaderboardType: 'score' | 'popularvote';
  }>();
  const contests = useTypedSelector(state => state.leaderboard.contests);
  const contest = contests.find(d => d.contest_id === parseInt(contestId!, 10));
  return contest ? <ContestLeaderboard type={type!} contest={contest} /> : <NotFound />;
}

export const Component = ContestLeaderboardWrapper;
