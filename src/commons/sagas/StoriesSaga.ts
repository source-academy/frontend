import { Context } from 'js-slang';
import { call, put, select } from 'redux-saga/effects';
import StoriesActions from 'src/features/stories/StoriesActions';
import {
  deleteStory,
  getStories,
  getStoriesUser,
  getStory,
  postStory,
  updateStory
} from 'src/features/stories/storiesComponents/BackendAccess';
import {
  StoryData,
  StoryListView,
  StoryListViews,
  StoryStatus,
  StoryView
} from 'src/features/stories/StoriesTypes';

import { OverallState, StoriesRole } from '../application/ApplicationTypes';
import { Tokens } from '../application/types/SessionTypes';
import { combineSagaHandlers } from '../redux/utils';
import { resetSideContent } from '../sideContent/SideContentActions';
import { actions } from '../utils/ActionsHelper';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { defaultStoryContent } from '../utils/StoriesHelper';
import { selectTokens } from './BackendSaga';
import { evalCodeSaga } from './WorkspaceSaga/helpers/evalCode';

const StoriesSaga = combineSagaHandlers(StoriesActions, {
  // TODO: This should be using `takeLatest`, not `takeEvery`
  getStoriesList: function* () {
    const tokens: Tokens = yield selectTokens();

    const draftStories: StoryListView[] = yield call(async () => {
      const resp = await getStories(tokens, StoryStatus.Draft);
      return resp ?? [];
    });

    const pendingStories: StoryListView[] = yield call(async () => {
      const resp = await getStories(tokens, StoryStatus.Pending);
      return resp ?? [];
    });

    const rejectedStories: StoryListView[] = yield call(async () => {
      const resp = await getStories(tokens, StoryStatus.Rejected);
      return resp ?? [];
    });

    const publishedStories: StoryListView[] = yield call(async () => {
      const resp = await getStories(tokens, StoryStatus.Published);
      return resp ?? [];
    });

    const allStories: StoryListViews = {
      draft: draftStories,
      pending: pendingStories,
      rejected: rejectedStories,
      published: publishedStories
    };

    yield put(actions.updateStoriesList(allStories));
  },
  setCurrentStoryId: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const storyId = action.payload;
    if (storyId) {
      const story: StoryView = yield call(getStory, tokens, storyId);
      yield put(actions.setCurrentStory(story));
    } else {
      const defaultStory: StoryData = {
        title: '',
        content: defaultStoryContent,
        pinOrder: null,
        status: StoryStatus.Draft,
        statusMessage: ''
      };
      yield put(actions.setCurrentStory(defaultStory));
    }
  },
  createStory: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const story = action.payload;
    const userId: number | undefined = yield select((state: OverallState) => state.stories.userId);

    if (userId === undefined) {
      yield call(showWarningMessage, 'Failed to create story: Invalid user');
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
      yield put(actions.setCurrentStoryId(createdStory.id));
    }

    yield put(actions.getStoriesList());
  },
  saveStory: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { story, id } = action.payload;
    const updatedStory: StoryView | null = yield call(
      updateStory,
      tokens,
      id,
      story.title,
      story.content,
      story.pinOrder,
      story.status,
      story.statusMessage
    );

    // TODO: Check correctness
    if (updatedStory) {
      yield put(actions.setCurrentStory(updatedStory));
    }

    yield put(actions.getStoriesList());
  },

  deleteStory: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const storyId = action.payload;
    yield call(deleteStory, tokens, storyId);

    yield put(actions.getStoriesList());
  },

  getStoriesUser: function* () {
    const tokens: Tokens = yield selectTokens();
    const me: {
      id: number;
      name: string;
      groupId: number;
      groupName: string;
      role: StoriesRole;
    } | null = yield call(getStoriesUser, tokens);

    if (!me) {
      yield put(actions.setCurrentStoriesUser(undefined, undefined));
      yield put(actions.setCurrentStoriesGroup(undefined, undefined, undefined));
      return;
    }
    yield put(actions.setCurrentStoriesUser(me.id, me.name));
    yield put(actions.setCurrentStoriesGroup(me.groupId, me.groupName, me.role));
  },
  evalStory: function* (action) {
    const env = action.payload.env;
    const code = action.payload.code;
    const execTime: number = yield select(
      (state: OverallState) => state.stories.envs[env].execTime
    );
    const context: Context = yield select((state: OverallState) => state.stories.envs[env].context);
    const codeFilePath = '/code.js';
    const codeFiles = {
      [codeFilePath]: code
    };
    yield put(resetSideContent(`stories.${env}`));
    yield call(
      evalCodeSaga,
      codeFiles,
      codeFilePath,
      context,
      execTime,
      'stories',
      action.type,
      env
    );
  }
});

export default StoriesSaga;
