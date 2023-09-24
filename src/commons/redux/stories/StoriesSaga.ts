import { call, put, select } from "redux-saga/effects";
import { Tokens } from "src/commons/application/types/SessionTypes";
import { showWarningMessage } from "src/commons/utils/notifications/NotificationsHelper";
import { defaultStoryContent } from "src/commons/utils/StoriesHelper";
import { deleteStory, getStoriesUser, getStory, postNewStoriesUsers, postStory, updateStory } from "src/features/stories/storiesComponents/BackendAccess";
import { StoriesRole, StoryData, StoryView } from "src/features/stories/StoriesTypes";

import { OverallState } from "../AllTypes";
import { combineSagaHandlers } from "../utils";
import { selectTokens, selectWorkspace } from "../utils/Selectors";
import { evalCode } from "../workspace/NewWorkspaceSaga";
import { StoriesEnvState } from "../workspace/WorkspaceReduxTypes";
import { storiesActions } from "./StoriesRedux";


export const StoriesSaga = combineSagaHandlers(storiesActions, {
  addNewStoriesUsersToCourse: function* ({ payload: { users, provider } }) {
    const tokens: Tokens = yield selectTokens();

    yield call(postNewStoriesUsers, tokens, users, provider);

    // TODO: Refresh the list of story users
    //       once that page is implemented
  },
  createStory: function* ({ payload: story }) {
    const tokens: Tokens = yield selectTokens();
    const userId: number | undefined = yield select((state: OverallState) => state.workspaces.stories.userId);

    if (userId === undefined) {
      yield call(
        showWarningMessage,
        'Failed to create story: Invalid user'
      );
      return;
    }

    const createdStory: StoryView | null = yield call(
      postStory,
      tokens,
      userId,
      story.title,
      story.content,
      story.pinOrder
    );

    // TODO: Check correctness
    if (createdStory) {
      yield put(storiesActions.setCurrentStoryId(createdStory.id));
    }

    yield put(storiesActions.getStoriesList());
  },
  deleteStory: function* ({ payload: storyId }) {
    const tokens: Tokens = yield selectTokens();
    yield call(deleteStory, tokens, storyId);

    yield put(storiesActions.getStoriesList());
  },
  evalStory: function* ({ payload: { env, code } }) {
    const { execTime, context }: StoriesEnvState = yield selectWorkspace(`stories.${env}`)

    const codeFilePath = '/code.js';
    const codeFiles = {
      [codeFilePath]: code
    };
    yield call(evalCode,
      codeFiles,
      codeFilePath,
      context,
      execTime,
      `stories.${env}`,
      'stories/evalStory'
    );
  },
  getStoriesList: function* ({ payload: storyId }) {
    const tokens: Tokens = yield selectTokens();
    if (storyId) {
      const story: StoryView = yield call(getStory, tokens, storyId);
      yield put(storiesActions.setCurrentStory(story));
    } else {
      const defaultStory: StoryData = {
        title: '',
        content: defaultStoryContent,
        pinOrder: null
      };
      yield put(storiesActions.setCurrentStory(defaultStory));
    }
  },
  getStoriesUser: function* ({ payload }) {
    const tokens: Tokens = yield selectTokens();
    const me: {
      id: number;
      name: string;
      groupId: number;
      groupName: string;
      role: StoriesRole;
    } | null = yield call(getStoriesUser, tokens);

    if (!me) {
      yield put(storiesActions.setCurrentStoriesUser(undefined, undefined));
      yield put(storiesActions.setCurrentStoriesGroup(undefined, undefined, undefined));
      return;
    }
    yield put(storiesActions.setCurrentStoriesUser(me.id, me.name));
    yield put(storiesActions.setCurrentStoriesGroup(me.groupId, me.groupName, me.role));
  },
  saveStory: function* ({ payload: { story, id } }) {
    const tokens: Tokens = yield selectTokens();
    const updatedStory: StoryView | null = yield call(
      updateStory,
      tokens,
      id,
      story.title,
      story.content,
      story.pinOrder
    );

    // TODO: Check correctness
    if (updatedStory) {
      yield put(storiesActions.setCurrentStory(updatedStory));
    }

    yield put(storiesActions.getStoriesList());
  },
  setCurrentStoryId: function* ({ payload: storyId }) {
    const tokens: Tokens = yield selectTokens();
    if (storyId) {
      const story: StoryView = yield call(getStory, tokens, storyId);
      yield put(storiesActions.setCurrentStory(story));
    } else {
      const defaultStory: StoryData = {
        title: '',
        content: defaultStoryContent,
        pinOrder: null
      };
      yield put(storiesActions.setCurrentStory(defaultStory));
    }
  }
});
