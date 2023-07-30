import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { ADD_NEW_STORIES_USERS_TO_COURSE } from 'src/features/academy/AcademyTypes';
import {
  deleteStory,
  getStories,
  getStory,
  postNewStoriesUsers,
  updateStory
} from 'src/features/stories/storiesComponents/BackendAccess';
import {
  DELETE_STORY,
  GET_STORIES_LIST,
  SAVE_STORY,
  SET_CURRENT_STORY_ID,
  StoryData,
  StoryListView,
  StoryView
} from 'src/features/stories/StoriesTypes';

import { Tokens } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';
import { defaultStoryContent } from '../utils/StoriesHelper';
import { selectTokens } from './BackendSaga';
import { handleResponseError } from './RequestsSaga';
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

  yield takeEvery(
    ADD_NEW_STORIES_USERS_TO_COURSE,
    function* (action: ReturnType<typeof actions.addNewStoriesUsersToCourse>): any {
      const tokens: Tokens = yield selectTokens();
      const { users, provider } = action.payload;

      const resp: Response | null = yield call(postNewStoriesUsers, tokens, users, provider);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      // TODO: Refresh the list of story users
      //       once that page is implemented
      yield call(showSuccessMessage, 'Users added!');
    }
  );

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
          content: defaultStoryContent
        };
        yield put(actions.setCurrentStory(defaultStory));
      }
    }
  );

  yield takeEvery(SAVE_STORY, function* (action: ReturnType<typeof actions.saveStory>) {
    const { story, id } = action.payload;
    const updatedStory: StoryView | null = yield call(async () => {
      const resp = await updateStory(id, story.title, story.content, story.pinOrder);
      if (!resp) {
        return null;
      }
      return resp.json();
    });

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
