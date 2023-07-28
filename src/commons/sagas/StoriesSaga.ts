import { SagaIterator } from 'redux-saga';

import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { ADD_NEW_STORIES_USERS_TO_COURSE } from 'src/features/academy/AcademyTypes';
import {
  getStories,
  getStory,
  putNewStoriesUsers
} from 'src/features/stories/storiesComponents/BackendAccess';

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
import { NameUsernameRole } from 'src/pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';

import { Tokens } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';

import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';
import { selectTokens } from './BackendSaga';
import { handleResponseError } from './RequestsSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';
import { defaultStoryContent } from '../utils/StoriesHelper';

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

  yield takeEvery(
    ADD_NEW_STORIES_USERS_TO_COURSE,
    function* (action: ReturnType<typeof actions.addNewStoriesUsersToCourse>): any {
      const tokens: Tokens = yield selectTokens();
      const { users, provider }: { users: NameUsernameRole[]; provider: string } = action.payload;

      const resp: Response | null = yield call(putNewStoriesUsers, tokens, users, provider);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      // TODO: Refresh the list of story users
      //       once that page is implemented
      yield call(showSuccessMessage, 'Users added!');
    }
  );

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
