import { Chapter, Variant } from 'js-slang/dist/types';

import { addStoryEnv, clearStoryEnv, evalStory } from '../StoriesActions';
import { ADD_STORY_ENV, CLEAR_STORY_ENV, EVAL_STORY } from '../StoriesTypes';

test('addStoryEnv generates correct action object', () => {
  const action = addStoryEnv('testEnv', Chapter.SOURCE_4, Variant.DEFAULT);
  expect(action).toEqual({
    type: ADD_STORY_ENV,
    payload: {
      env: 'testEnv',
      chapter: Chapter.SOURCE_4,
      variant: Variant.DEFAULT
    }
  });
});

test('clearStoryEnv generates correct action object', () => {
  const action = clearStoryEnv();
  expect(action).toEqual({
    type: CLEAR_STORY_ENV,
    payload: {
      env: undefined
    }
  });
});

test('clearStoryEnv with environment generates correct action object', () => {
  const action = clearStoryEnv('default');
  expect(action).toEqual({
    type: CLEAR_STORY_ENV,
    payload: {
      env: 'default'
    }
  });
});

test('evalStory generates correct action object', () => {
  const action = evalStory('testEnv', '1;');
  expect(action).toEqual({
    type: EVAL_STORY,
    payload: {
      env: 'testEnv',
      code: '1;'
    }
  });
});
