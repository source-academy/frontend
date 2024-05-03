import { Chapter, Variant } from 'js-slang/dist/types';

import { addStoryEnv, clearStoryEnv, evalStory } from '../StoriesActions';

test('addStoryEnv generates correct action object', () => {
  const action = addStoryEnv('testEnv', Chapter.SOURCE_4, Variant.DEFAULT);
  expect(action).toEqual({
    type: addStoryEnv.type,
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
    type: clearStoryEnv.type,
    payload: {
      env: undefined
    }
  });
});

test('clearStoryEnv with environment generates correct action object', () => {
  const action = clearStoryEnv('default');
  expect(action).toEqual({
    type: clearStoryEnv.type,
    payload: {
      env: 'default'
    }
  });
});

test('evalStory generates correct action object', () => {
  const action = evalStory('testEnv', '1;');
  expect(action).toEqual({
    type: evalStory.type,
    payload: {
      env: 'testEnv',
      code: '1;'
    }
  });
});
