import LeaderboardActions from "src/features/leaderboard/LeaderboardActions";
import { combineSagaHandlers } from "../redux/utils";
import { call, put } from 'redux-saga/effects';
import { Tokens } from '../application/types/SessionTypes';
import { selectTokens } from './BackendSaga';
import { getAllTotalXp } from "./RequestsSaga";
import { actions } from "../utils/ActionsHelper";

const LeaderboardSaga = combineSagaHandlers(LeaderboardActions, {
    getAllUsersXp: function* (action) {
        const tokens: Tokens = yield selectTokens();
    
        const usersXp = yield call(getAllTotalXp, tokens);
    
        if (usersXp) {
          yield put(actions.saveAllUsersXp(usersXp))
        }
    }
});

export default LeaderboardSaga
