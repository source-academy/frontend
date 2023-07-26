import { defaultStories } from '../../../commons/application/ApplicationTypes';
import { StoriesReducer } from '../StoriesReducer';
import { UPDATE_STORIES_CONTENT } from '../StoriesTypes';

test('UPDATE_STORIES_CONTENT sets content correctly', () => {
  const action = {
    type: UPDATE_STORIES_CONTENT,
    payload: '# New Text'
  };
  expect(StoriesReducer(defaultStories, action)).toEqual({
    ...defaultStories,
    content: action.payload
  });
});
