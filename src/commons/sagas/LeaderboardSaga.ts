import { call, put } from 'redux-saga/effects';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';

import { Tokens } from '../application/types/SessionTypes';
import { combineSagaHandlers } from '../redux/utils';
import { actions } from '../utils/ActionsHelper';
import { selectTokens } from './BackendSaga';
import {
  getAllContests,
  getContestPopularVoteLeaderboard,
  getContestScoreLeaderboard,
  getOverallLeaderboardXP
} from './RequestsSaga';

const LeaderboardSaga = combineSagaHandlers({
  [LeaderboardActions.getOverallLeaderboardXP.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { page, pageSize } = action.payload;

    const paginatedUsersXp = yield call(getOverallLeaderboardXP, page, pageSize, tokens);

    if (paginatedUsersXp) {
      yield put(actions.saveOverallLeaderboardXP(paginatedUsersXp));
    }
  },

  [LeaderboardActions.getAllContestScores.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { assessmentId, visibleEntries } = action.payload;

    const contestScores = yield call(
      getContestScoreLeaderboard,
      assessmentId,
      visibleEntries,
      tokens
    );

    if (contestScores) {
      yield put(actions.saveAllContestScores(contestScores));
    }
  },

  [LeaderboardActions.getAllContestPopularVotes.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { assessmentId, visibleEntries } = action.payload;

    const contestPopularVotes = yield call(
      getContestPopularVoteLeaderboard,
      assessmentId,
      visibleEntries,
      tokens
    );
    if (contestPopularVotes) {
      yield put(actions.saveAllContestPopularVotes(contestPopularVotes));
    }
  },

  [LeaderboardActions.getContests.type]: function* () {
    const tokens: Tokens = yield selectTokens();

    const contests = yield call(getAllContests, tokens);

    if (contests) {
      yield put(actions.saveContests(contests));
    }
  }
});

export default LeaderboardSaga;
