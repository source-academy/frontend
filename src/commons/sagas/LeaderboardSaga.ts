import LeaderboardActions from "src/features/leaderboard/LeaderboardActions";
import { combineSagaHandlers } from "../redux/utils";
import { call, put } from 'redux-saga/effects';
import { Tokens } from '../application/types/SessionTypes';
import { selectTokens } from './BackendSaga';
import { getAllTotalXp, getContestScoreLeaderboard, getContestPopularVoteLeaderboard } from "./RequestsSaga";
import { actions } from "../utils/ActionsHelper";

const LeaderboardSaga = combineSagaHandlers(LeaderboardActions, {
    getAllUsersXp: function* (action) {
        const tokens: Tokens = yield selectTokens();
    
        const usersXp = yield call(getAllTotalXp, tokens);
    
        if (usersXp) {
          yield put(actions.saveAllUsersXp(usersXp))
        }
    },

    getAllContestScores: function* (action) {
      const tokens: Tokens = yield selectTokens();
      const assessmentId = action.payload;
  
      const contestScores = yield call(getContestScoreLeaderboard, assessmentId, tokens);
  
      if (contestScores) {
        yield put(actions.saveAllContestScores(contestScores))
      }
    },

    getAllContestPopularVotes: function* (action) {
      const tokens: Tokens = yield selectTokens();
      const assessmentId = action.payload;
  
      const contestPopularVotes = yield call(getContestPopularVoteLeaderboard, assessmentId, tokens);
  
      if (contestPopularVotes) {
        yield put(actions.saveAllContestPopularVotes(contestPopularVotes))
      }
    }
});

export default LeaderboardSaga
