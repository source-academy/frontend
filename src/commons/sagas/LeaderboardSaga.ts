import { call, put } from 'redux-saga/effects';
import LeaderboardActions from 'src/features/leaderboard/LeaderboardActions';

import { Tokens } from '../application/types/SessionTypes';
import { combineSagaHandlers } from '../redux/utils';
import { actions } from '../utils/ActionsHelper';
import { selectTokens } from './BackendSaga';
import {
  getAllTotalXp,
  getContestPopularVoteLeaderboard,
  getContestScoreLeaderboard,
  getAllContests
} from './RequestsSaga';

const LeaderboardSaga = combineSagaHandlers(LeaderboardActions, {
  getAllUsersXp: function* () {
    const tokens: Tokens = yield selectTokens();

    const usersXp = yield call(getAllTotalXp, tokens);

    if (usersXp) {
      yield put(actions.saveAllUsersXp(usersXp));
    }
  },

  getAllContestScores: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const assessmentId = action.payload;

    const contestScores = yield call(getContestScoreLeaderboard, assessmentId, tokens);

    if (contestScores) {
      yield put(actions.saveAllContestScores(contestScores));
    }
  },

  getAllContestPopularVotes: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const assessmentId = action.payload;

    const contestPopularVotes = yield call(getContestPopularVoteLeaderboard, assessmentId, tokens);
    if (contestPopularVotes) {
      yield put(actions.saveAllContestPopularVotes(contestPopularVotes));
    }
  },

  getContests: function* () {
    const tokens: Tokens = yield selectTokens();

    const contests = yield call(getAllContests, tokens);
    console.log(contests, 'rows');

    if (contests) {
      yield put(actions.saveContests(contests));
    }
  },
});

export default LeaderboardSaga;
