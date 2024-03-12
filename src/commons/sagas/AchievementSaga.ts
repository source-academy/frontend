import { SagaIterator } from 'redux-saga';
import { call, delay, put, select } from 'redux-saga/effects';

import {
  AchievementGoal,
  ADD_EVENT,
  BULK_UPDATE_ACHIEVEMENTS,
  BULK_UPDATE_GOALS,
  EventType,
  GET_ACHIEVEMENTS,
  GET_GOALS,
  GET_OWN_GOALS,
  GET_USER_ASSESSMENT_OVERVIEWS,
  GET_USERS,
  HANDLE_EVENT,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  UPDATE_GOAL_PROGRESS,
  UPDATE_OWN_GOAL_PROGRESS
} from '../../features/achievement/AchievementTypes';
import { updateGoalProcessed } from '../achievement/AchievementManualEditor';
import AchievementInferencer from '../achievement/utils/AchievementInferencer';
import { goalIncludesEvents, incrementCount } from '../achievement/utils/EventHandler';
import { OverallState } from '../application/ApplicationTypes';
import { Tokens } from '../application/types/SessionTypes';
import { SideContentType } from '../sideContent/SideContentTypes';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import {
  bulkUpdateAchievements,
  bulkUpdateGoals,
  getAchievements,
  getAllUsers,
  getGoals,
  getOwnGoals,
  getUserAssessmentOverviews,
  removeAchievement,
  removeGoal,
  updateGoalProgress,
  updateOwnGoalProgress
} from './RequestsSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

function selectTokens() {
  return select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));
}

export default function* AchievementSaga(): SagaIterator {
  yield takeEvery(
    BULK_UPDATE_ACHIEVEMENTS,
    function* (action: ReturnType<typeof actions.bulkUpdateAchievements>): any {
      const tokens: Tokens = yield selectTokens();

      const achievements = action.payload;

      const resp = yield call(bulkUpdateAchievements, achievements, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(
    BULK_UPDATE_GOALS,
    function* (action: ReturnType<typeof actions.bulkUpdateGoals>): any {
      const tokens: Tokens = yield selectTokens();

      const goals = action.payload;

      const resp = yield call(bulkUpdateGoals, goals, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(GET_ACHIEVEMENTS, function* (): any {
    const tokens: Tokens = yield selectTokens();

    const achievements = yield call(getAchievements, tokens);

    if (achievements) {
      yield put(actions.saveAchievements(achievements));
    }
  });

  yield takeEvery(GET_GOALS, function* (action: ReturnType<typeof actions.getGoals>): any {
    const tokens: Tokens = yield selectTokens();

    const studentCourseRegId = action.payload;

    const goals = yield call(getGoals, tokens, studentCourseRegId);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  });

  yield takeEvery(GET_OWN_GOALS, function* (action: ReturnType<typeof actions.getOwnGoals>): any {
    const tokens: Tokens = yield selectTokens();

    const goals = yield call(getOwnGoals, tokens);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  });

  yield takeEvery(GET_USERS, function* (action: ReturnType<typeof actions.getUsers>): any {
    const tokens: Tokens = yield selectTokens();

    const users = yield call(getAllUsers, tokens);

    if (users) {
      yield put(actions.saveUsers(users));
    }
  });

  yield takeEvery(
    REMOVE_ACHIEVEMENT,
    function* (action: ReturnType<typeof actions.removeAchievement>): any {
      const tokens: Tokens = yield selectTokens();

      const achievement = action.payload;

      const resp = yield call(removeAchievement, achievement, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(REMOVE_GOAL, function* (action: ReturnType<typeof actions.removeGoal>): any {
    const tokens: Tokens = yield selectTokens();

    const definition = action.payload;

    const resp = yield call(removeGoal, definition, tokens);

    if (!resp) {
      return;
    }
  });

  yield takeEvery(
    UPDATE_OWN_GOAL_PROGRESS,
    function* (action: ReturnType<typeof actions.updateOwnGoalProgress>): any {
      const tokens: Tokens = yield selectTokens();

      const progress = action.payload;

      const resp = yield call(updateOwnGoalProgress, progress, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(
    UPDATE_GOAL_PROGRESS,
    function* (action: ReturnType<typeof actions.updateGoalProgress>): any {
      const tokens: Tokens = yield selectTokens();

      const { studentCourseRegId, progress } = action.payload;

      const resp = yield call(updateGoalProgress, studentCourseRegId, progress, tokens);

      if (!resp) {
        return;
      }
      if (resp.ok) {
        yield put(actions.getGoals(studentCourseRegId));
        updateGoalProcessed();
      }
    }
  );

  let loggedEvents: EventType[][] = [];
  let timeoutSet: boolean = false;
  const updateInterval = 3000;

  yield takeEvery(ADD_EVENT, function* (action: ReturnType<typeof actions.addEvent>): any {
    const role = yield select((state: OverallState) => state.session.role);
    const enableAchievements = yield select(
      (state: OverallState) => state.session.enableAchievements
    );
    if (action.payload.find(e => e === EventType.ERROR)) {
      // TODO update this to work with new side content system
      // Flash the home icon if there is an error and the user is in the CSE machine or subst viz tab
      const introIcon = document.getElementById(SideContentType.introduction + '-icon');
      const cseTab = document.getElementById(
        'bp4-tab-panel_side-content-tabs_' + SideContentType.cseMachine
      );
      const substTab = document.getElementById(
        'bp4-tab-panel_side-content-tabs_' + SideContentType.substVisualizer
      );
      if (
        (cseTab && cseTab.ariaHidden === 'false') ||
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
  });

  yield takeEvery(HANDLE_EVENT, function* (action: ReturnType<typeof actions.handleEvent>): any {
    const tokens: Tokens = yield selectTokens();

    // get the most recent list of achievements
    const backendAchievements = yield call(getAchievements, tokens);
    if (backendAchievements) {
      yield put(actions.saveAchievements(backendAchievements));
    }

    // get the goals and their progress from the backend
    const backendGoals = yield call(getOwnGoals, tokens);
    if (backendGoals) {
      yield put(actions.saveGoals(backendGoals));
    } else {
      // if there are no goals, handling events will do nothing
      return;
    }

    const achievements = yield select((state: OverallState) => state.achievement.achievements);
    const goals = yield select((state: OverallState) => state.achievement.goals);

    const inferencer = new AchievementInferencer(achievements, goals);
    const loggedEvents: EventType[][] = action.payload;

    const updatedGoals = new Set<string>();

    loggedEvents.forEach((events: EventType[]) => {
      const eventGoalUuids = goals
        .filter((goal: AchievementGoal) => goalIncludesEvents(goal, events))
        .map((goal: AchievementGoal) => goal.uuid);
      eventGoalUuids.forEach((uuid: string) => {
        incrementCount(uuid, inferencer);
        updatedGoals.add(uuid);
      });
    });

    for (const uuid of updatedGoals) {
      const resp = yield call(updateOwnGoalProgress, inferencer.getGoalProgress(uuid), tokens);

      if (!resp) {
        return;
      }
    }
  });

  yield takeEvery(
    GET_USER_ASSESSMENT_OVERVIEWS,
    function* (action: ReturnType<typeof actions.getUserAssessmentOverviews>): any {
      const tokens: Tokens = yield selectTokens();

      const assessmentOverviews = yield call(getUserAssessmentOverviews, action.payload, tokens);

      if (assessmentOverviews) {
        yield put(actions.saveUserAssessmentOverviews(assessmentOverviews));
      }
    }
  );
}
