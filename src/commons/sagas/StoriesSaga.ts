import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { getStories, getStory } from 'src/features/stories/storiesComponents/BackendAccess';
import {
  FETCH_STORY,
  GET_STORIES_LIST,
  StoryListView,
  StoryView
} from 'src/features/stories/StoriesTypes';

import { actions } from '../utils/ActionsHelper';

export function* storiesSaga(): SagaIterator {
  yield takeLatest(GET_STORIES_LIST, function* () {
    const allStories: StoryListView[] = yield call(async () => {
      const resp = await getStories();
      if (!resp) {
        return [];
      }
      return resp.json();
    });

    yield put(actions.updateStoriesList(allStories));
  });

  yield takeLatest(FETCH_STORY, function* (action: ReturnType<typeof actions.fetchStory>) {
    const storyId = action.payload;
    const story: StoryView = yield call(async () => {
      const resp = await getStory(storyId);
      if (!resp) {
        return null;
      }
      return resp.json();
    });

    yield put(actions.setCurrentStory(story));
  });
}

export default storiesSaga;
