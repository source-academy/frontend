import { SagaIterator } from 'redux-saga';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { ADD_NEW_STORIES_USERS_TO_COURSE } from 'src/features/academy/AcademyTypes';
import {
  deleteStory,
  getStories,
  getStory,
  postNewStoriesUsers,
  postStory,
  updateStory
} from 'src/features/stories/storiesComponents/BackendAccess';
import {
  CREATE_STORY,
  DELETE_STORY,
  GET_STORIES_LIST,
  SAVE_STORY,
  SET_CURRENT_STORY_ID,
  StoryData,
  StoryListView,
  StoryView
} from 'src/features/stories/StoriesTypes';

import { OverallState } from '../application/ApplicationTypes';
import { Tokens } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { defaultStoryContent } from '../utils/StoriesHelper';
import { selectTokens } from './BackendSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export function* storiesSaga(): SagaIterator {
  yield takeLatest(GET_STORIES_LIST, function* () {
    const allStories: StoryListView[] = yield call(async () => {
      const resp = await getStories();
      return resp ?? [];
    });

    yield put(actions.updateStoriesList(allStories));
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

  // takeEvery used to ensure that setting to null (clearing the story) is always
  // handled even if a refresh is triggered later.
  yield takeEvery(
    SET_CURRENT_STORY_ID,
    function* (action: ReturnType<typeof actions.setCurrentStoryId>) {
      const storyId = action.payload;
      if (storyId) {
        const story: StoryView = yield call(getStory, storyId);
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
    const story = action.payload;
    // FIXME: User a separate storyUserId instead of the current user
    const userId: number | undefined = yield select((state: OverallState) => state.session.userId);

    if (userId === undefined) {
      showWarningMessage('Failed to create story: Invalid user');
      return;
    }

    const createdStory: StoryView | null = yield call(
      postStory,
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
    const { story, id } = action.payload;
    const updatedStory: StoryView | null = yield call(
      updateStory,
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
    const storyId = action.payload;
    yield call(deleteStory, storyId);

    yield put(actions.getStoriesList());
  });
}

export default storiesSaga;
