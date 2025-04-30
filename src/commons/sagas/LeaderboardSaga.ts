import { call, put } from 'redux-saga/effects';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';

import { Tokens } from '../application/types/SessionTypes';
import { combineSagaHandlers } from '../redux/utils';
import { actions } from '../utils/ActionsHelper';
import { selectTokens } from './BackendSaga';
import {
  getAllContests,
  getAllTotalXp,
  getPaginatedTotalXp,
  getContestPopularVoteLeaderboard,
  getContestScoreLeaderboard
} from './RequestsSaga';

const LeaderboardSaga = combineSagaHandlers(LeaderboardActions, {
  getAllUsersXp: function* () {
    const tokens: Tokens = yield selectTokens();

    const usersXp = yield call(getAllTotalXp, tokens);

    if (usersXp) {
      yield put(actions.saveAllUsersXp(usersXp));
    }
  },

  getPaginatedLeaderboardXp: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { page, pageSize } = action.payload;

    const paginatedUsersXp = yield call(getPaginatedTotalXp, page, pageSize, tokens);

    if (paginatedUsersXp) {
      yield put(actions.savePaginatedLeaderboardXp(paginatedUsersXp));
    }
  },

  getAllContestScores: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { assessmentId, visibleEntries } = action.payload;

    const contestScores = yield call(getContestScoreLeaderboard, assessmentId, visibleEntries, tokens);

    if (contestScores) {
      yield put(actions.saveAllContestScores(contestScores));
    }
  },

  getAllContestPopularVotes: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { assessmentId, visibleEntries } = action.payload;

    const contestPopularVotes = yield call(getContestPopularVoteLeaderboard, assessmentId, visibleEntries, tokens);
    if (contestPopularVotes) {
      yield put(actions.saveAllContestPopularVotes(contestPopularVotes));
    }
  },

  getContests: function* () {
    const tokens: Tokens = yield selectTokens();

    const contests = yield call(getAllContests, tokens);

    if (contests) {
      yield put(actions.saveContests(contests));
    }
  }
});

export default LeaderboardSaga;
