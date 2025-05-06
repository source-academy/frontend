import { call, delay, put, select } from 'redux-saga/effects';
import AchievementActions from 'src/features/achievement/AchievementActions';

import { type AchievementGoal, EventType } from '../../features/achievement/AchievementTypes';
import { updateGoalProcessed } from '../achievement/AchievementManualEditor';
import AchievementInferencer from '../achievement/utils/AchievementInferencer';
import { goalIncludesEvents, incrementCount } from '../achievement/utils/EventHandler';
import type { OverallState } from '../application/ApplicationTypes';
import type { Tokens } from '../application/types/SessionTypes';
import { combineSagaHandlers } from '../redux/utils';
import SideContentActions from '../sideContent/SideContentActions';
import { getLocation } from '../sideContent/SideContentHelper';
import { SideContentType } from '../sideContent/SideContentTypes';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { selectTokens } from './BackendSaga';
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

const AchievementSaga = combineSagaHandlers({
  [AchievementActions.bulkUpdateAchievements.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const achievements = action.payload;
    const resp = yield call(bulkUpdateAchievements, achievements, tokens);

    if (!resp) {
      return;
    }
  },
  [AchievementActions.bulkUpdateGoals.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const goals = action.payload;

    const resp = yield call(bulkUpdateGoals, goals, tokens);

    if (!resp) {
      return;
    }
  },
  [AchievementActions.getAchievements.type]: function* () {
    const tokens: Tokens = yield selectTokens();

    const achievements = yield call(getAchievements, tokens);

    if (achievements) {
      yield put(actions.saveAchievements(achievements));
    }
  },
  [AchievementActions.getGoals.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const studentCourseRegId = action.payload;

    const goals = yield call(getGoals, tokens, studentCourseRegId);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  },
  [AchievementActions.getOwnGoals.type]: function* () {
    const tokens: Tokens = yield selectTokens();

    const goals = yield call(getOwnGoals, tokens);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  },
  [AchievementActions.getUsers.type]: function* () {
    const tokens: Tokens = yield selectTokens();

    const users = yield call(getAllUsers, tokens);

    if (users) {
      yield put(actions.saveUsers(users));
    }
  },
  [AchievementActions.removeAchievement.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const achievement = action.payload;

    const resp = yield call(removeAchievement, achievement, tokens);

    if (!resp) {
      return;
    }
  },
  [AchievementActions.removeGoal.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const definition = action.payload;

    const resp = yield call(removeGoal, definition, tokens);

    if (!resp) {
      return;
    }
  },
  [AchievementActions.updateOwnGoalProgress.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const progress = action.payload;

    const resp = yield call(updateOwnGoalProgress, progress, tokens);

    if (!resp) {
      return;
    }
  },
  [AchievementActions.updateGoalProgress.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const { studentCourseRegId, progress } = action.payload;

    const resp = yield call(updateGoalProgress, studentCourseRegId, progress, tokens);

    if (!resp) {
      return;
    }
    if (resp.ok) {
      yield put(actions.getGoals(studentCourseRegId));
      yield call(updateGoalProcessed);
    }
  },
  [AchievementActions.addEvent.type]: function* ({ payload: { eventNames, workspaceLocation } }) {
    let loggedEvents: EventType[][] = [];
    let timeoutSet: boolean = false;
    const updateInterval = 3000;

    const role = yield select((state: OverallState) => state.session.role);
    const enableAchievements = yield select(
      (state: OverallState) => state.session.enableAchievements
    );
    if (workspaceLocation !== undefined && eventNames.find(e => e === EventType.ERROR)) {
      const selectedTab: SideContentType | undefined = yield select((state: OverallState) => {
        const [loc, storyEnv] = getLocation(workspaceLocation);
        return loc === 'stories'
          ? state.sideContent.stories[storyEnv].selectedTab
          : state.sideContent[loc].selectedTab;
      });

      if (
        selectedTab === SideContentType.cseMachine ||
        selectedTab === SideContentType.substVisualizer
      ) {
        yield put(
          SideContentActions.beginAlertSideContent(SideContentType.introduction, workspaceLocation)
        );
      }
    }
    if (role && enableAchievements && !Constants.playgroundOnly) {
      loggedEvents.push(eventNames);

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
  [AchievementActions.handleEvent.type]: function* (action) {
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
  },
  [AchievementActions.getUserAssessmentOverviews.type]: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const assessmentOverviews = yield call(getUserAssessmentOverviews, action.payload, tokens);

    if (assessmentOverviews) {
      yield put(actions.saveUserAssessmentOverviews(assessmentOverviews));
    }
  }
});

export default AchievementSaga;
