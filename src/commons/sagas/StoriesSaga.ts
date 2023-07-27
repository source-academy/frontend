import { SagaIterator } from 'redux-saga';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  deleteStory,
  getStories,
  getStory
} from 'src/features/stories/storiesComponents/BackendAccess';
import {
  DELETE_STORY,
  FETCH_STORY,
  GET_STORIES_LIST,
  SET_CURRENT_STORY_ID,
  StoryData,
  StoryListView,
  StoryView
} from 'src/features/stories/StoriesTypes';

import { actions } from '../utils/ActionsHelper';
import { defaultStoryContent } from '../utils/StoriesHelper';

export function* storiesSaga(): SagaIterator {
  yield takeLatest(GET_STORIES_LIST, function* () {
    const allStories: StoryListView[] = yield call(async () => {
      const resp = await getStories();
      return resp ?? [];
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

  // takeEvery used to ensure that setting to null (clearing the story) is always
  // handled even if a refresh is triggered later.
  yield takeEvery(
    SET_CURRENT_STORY_ID,
    function* (action: ReturnType<typeof actions.setCurrentStoryId>) {
      const storyId = action.payload;
      if (storyId) {
        yield put(actions.fetchStory(storyId));
      } else {
        const defaultStory: StoryData = {
          title: '',
          content: defaultStoryContent
        };
        yield put(actions.setCurrentStory(defaultStory));
      }
    }
  );

  //   yield takeEvery(SAVE_STORY, function* (action: ReturnType<typeof actions.saveStory>) {
  //     const story = action.payload;
  //     const updatedStory: StoryView | null = yield call(async () => {
  //       // TODO: Support pin order
  //       const resp = await updateStory(story.id, story.title, story.content);
  //       if (!resp) {
  //         return null;
  //       }
  //       return resp.json();
  //     });

  //     // TODO: Check correctness
  //     if (updatedStory) {
  //       yield put(actions.setCurrentStory(updatedStory));
  //     }
  //   });

  yield takeEvery(DELETE_STORY, function* (action: ReturnType<typeof actions.deleteStory>) {
    const storyId = action.payload;
    yield call(async () => {
      const resp = await deleteStory(storyId);
      if (!resp) {
        return null;
      }
      return resp.json();
    });

    yield put(actions.getStoriesList());
  });
}

export default storiesSaga;
