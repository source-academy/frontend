import { call, delay, put } from "redux-saga/effects";
import { updateGoalProcessed } from "src/commons/achievement/AchievementManualEditor";
import { SessionState, Tokens } from "src/commons/application/types/SessionTypes";
import { bulkUpdateAchievements, bulkUpdateGoals, getAchievements, getAllUsers, getGoals, getOwnGoals, getUserAssessmentOverviews, removeAchievement, removeGoal, updateGoalProgress, updateOwnGoalProgress } from "src/commons/sagas/RequestsSaga";
import { SideContentType } from "src/commons/sideContent/SideContentTypes";
import Constants from "src/commons/utils/Constants";
import { EventType } from "src/features/achievement/AchievementTypes";

import { actions } from "../ActionsHelper";
import { combineSagaHandlers } from "../utils";
import { selectSession, selectTokens } from "../utils/Selectors";
import { achievementActions } from "./AchievementReducer";

let loggedEvents: EventType[][] = [];
let timeoutSet: boolean = false;
const updateInterval = 3000;

export const AchievementSaga = combineSagaHandlers(achievementActions, {
  addEvent: function* (action) {
    const { role, enableAchievements }: SessionState = yield selectSession()

    if (action.payload.find(e => e === EventType.ERROR)) {
      // Flash the home icon if there is an error and the user is in the env viz or subst viz tab
      const introIcon = document.getElementById(SideContentType.introduction + '-icon');
      const envTab = document.getElementById(
        'bp4-tab-panel_side-content-tabs_' + SideContentType.envVisualizer
      );
      const substTab = document.getElementById(
        'bp4-tab-panel_side-content-tabs_' + SideContentType.substVisualizer
      );
      if (
        (envTab && envTab.ariaHidden === 'false') ||
        (substTab && substTab.ariaHidden === 'false')
      ) {
        introIcon && introIcon.classList.add('side-content-tab-alert-error');
      }
    }
    if (role && enableAchievements && !Constants.playgroundOnly) {
      loggedEvents.push(action.payload);

      if (!timeoutSet && role) {
        // make sure that only one action every interval will handleEvent
        timeoutSet = true;
        yield delay(updateInterval);

        timeoutSet = false;
        yield put(actions.handleEvent(loggedEvents));
        loggedEvents = [];
      }
    }
  },
  bulkUpdateAchievements: function* ({ payload: achievements }) {
    const tokens: Tokens = yield selectTokens();
    yield call(bulkUpdateAchievements, achievements, tokens);

    // if (!resp) {
    //   return;
    // }
  },
  bulkUpdateGoals: function* ({ payload: goals }) {
    const tokens: Tokens = yield selectTokens();
    yield call(bulkUpdateGoals, goals, tokens);
  },
  getAchievements: function* () {
    const tokens: Tokens = yield selectTokens();

    const achievements = yield call(getAchievements, tokens);

    if (achievements) {
      yield put(actions.saveAchievements(achievements));
    }
  },
  getGoals: function* ({ payload: studentCourseRegId }) {
    const tokens: Tokens = yield selectTokens();

    const goals = yield call(getGoals, tokens, studentCourseRegId);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  },
  getOwnGoals: function* () {
    const tokens: Tokens = yield selectTokens();

    const goals = yield call(getOwnGoals, tokens);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  },
  getUsers: function* () {
    const tokens: Tokens = yield selectTokens();

    const users = yield call(getAllUsers, tokens);

    if (users) {
      yield put(actions.saveUsers(users));
    }
  },
  getUserAssessmentOverviews: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const assessmentOverviews = yield call(getUserAssessmentOverviews, action.payload, tokens);

    if (assessmentOverviews) {
      yield put(actions.saveUserAssessmentOverviews(assessmentOverviews));
    }
  },
  removeAchievement: function* ({ payload: achievement }) {
    const tokens: Tokens = yield selectTokens();
    yield call(removeAchievement, achievement, tokens);
  },
  removeGoal: function* ({ payload: definition }) {
    const tokens: Tokens = yield selectTokens();
    yield call(removeGoal, definition, tokens);
  },
  updateGoalProgress: function* ({ payload: { studentCourseRegId, progress }}) {
    const tokens: Tokens = yield selectTokens();
    const resp = yield call(updateGoalProgress, studentCourseRegId, progress, tokens);

    if (resp && resp.ok) {
      yield put(actions.getGoals(studentCourseRegId));
      yield call(updateGoalProcessed);
    }
  },
  updateOwnGoalProgress: function* ({ payload: progress }) {
    const tokens: Tokens = yield selectTokens();
    yield call(updateOwnGoalProgress, progress, tokens);
  }
})
