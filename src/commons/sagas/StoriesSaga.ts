import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { getStories } from 'src/features/stories/storiesComponents/BackendAccess';
import { GET_STORIES_LIST, StoryListView } from 'src/features/stories/StoriesTypes';

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
}

export default storiesSaga;
