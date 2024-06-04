import { Chapter, Variant } from 'js-slang/dist/types';

import StoriesActions from '../StoriesActions';

test('addStoryEnv generates correct action object', () => {
  const action = StoriesActions.addStoryEnv('testEnv', Chapter.SOURCE_4, Variant.DEFAULT);
  expect(action).toEqual({
    type: StoriesActions.addStoryEnv.type,
    payload: {
      env: 'testEnv',
      chapter: Chapter.SOURCE_4,
      variant: Variant.DEFAULT
    }
  });
});

test('clearStoryEnv generates correct action object', () => {
  const action = StoriesActions.clearStoryEnv();
  expect(action).toEqual({
    type: StoriesActions.clearStoryEnv.type,
    payload: {
      env: undefined
    }
  });
});

test('clearStoryEnv with environment generates correct action object', () => {
  const action = StoriesActions.clearStoryEnv('default');
  expect(action).toEqual({
    type: StoriesActions.clearStoryEnv.type,
    payload: {
      env: 'default'
    }
  });
});

test('evalStory generates correct action object', () => {
  const action = StoriesActions.evalStory('testEnv', '1;');
  expect(action).toEqual({
    type: StoriesActions.evalStory.type,
    payload: {
      env: 'testEnv',
      code: '1;'
    }
  });
});
