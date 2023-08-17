import { SagaIterator } from 'redux-saga';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { ADD_NEW_STORIES_USERS_TO_COURSE } from 'src/features/academy/AcademyTypes';
import {
  deleteStory,
  getStories,
  getStoriesUser,
  getStory,
  postNewStoriesUsers,
  postStory,
  updateStory
} from 'src/features/stories/storiesComponents/BackendAccess';
import {
  CREATE_STORY,
  DELETE_STORY,
  GET_STORIES_LIST,
  GET_STORIES_USER,
  SAVE_STORY,
  SET_CURRENT_STORY_ID,
  StoryData,
  StoryListView,
  StoryView
} from 'src/features/stories/StoriesTypes';

import { OverallState, StoriesRole } from '../application/ApplicationTypes';
import { Tokens } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { defaultStoryContent } from '../utils/StoriesHelper';
import { selectTokens } from './BackendSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export function* storiesSaga(): SagaIterator {
  yield takeLatest(GET_STORIES_LIST, function* () {
    const tokens: Tokens = yield selectTokens();
    const allStories: StoryListView[] = yield call(async () => {
      const resp = await getStories(tokens);
      return resp ?? [];
    });

    yield put(actions.updateStoriesList(allStories));
  });

  // takeEvery used to ensure that setting to null (clearing the story) is always
  // handled even if a refresh is triggered later.
  yield takeEvery(
    SET_CURRENT_STORY_ID,
    function* (action: ReturnType<typeof actions.setCurrentStoryId>) {
      const tokens: Tokens = yield selectTokens();
      const storyId = action.payload;
      if (storyId) {
        const story: StoryView = yield call(getStory, tokens, storyId);
        yield put(actions.setCurrentStory(story));
      } else {
        const defaultStory: StoryData = {
          title: '',
          content: defaultStoryContent,
          pinOrder: null
        };
        yield put(actions.setCurrentStory(defaultStory));
      }
    }
  );

  yield takeEvery(CREATE_STORY, function* (action: ReturnType<typeof actions.createStory>) {
    const tokens: Tokens = yield selectTokens();
    const story = action.payload;
    const userId: number | undefined = yield select((state: OverallState) => state.stories.userId);

    if (userId === undefined) {
      showWarningMessage('Failed to create story: Invalid user');
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
  });

  yield takeEvery(SAVE_STORY, function* (action: ReturnType<typeof actions.saveStory>) {
    const tokens: Tokens = yield selectTokens();
    const { story, id } = action.payload;
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
      yield put(actions.setCurrentStory(updatedStory));
    }

    yield put(actions.getStoriesList());
  });

  yield takeEvery(DELETE_STORY, function* (action: ReturnType<typeof actions.deleteStory>) {
    const tokens: Tokens = yield selectTokens();
    const storyId = action.payload;
    yield call(deleteStory, tokens, storyId);

    yield put(actions.getStoriesList());
  });

  yield takeEvery(GET_STORIES_USER, function* () {
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
  });

  yield takeEvery(
    ADD_NEW_STORIES_USERS_TO_COURSE,
    function* (action: ReturnType<typeof actions.addNewStoriesUsersToCourse>): any {
      const tokens: Tokens = yield selectTokens();
      const { users, provider } = action.payload;

      yield call(postNewStoriesUsers, tokens, users, provider);

      // TODO: Refresh the list of story users
      //       once that page is implemented
    }
  );
}

export default storiesSaga;
