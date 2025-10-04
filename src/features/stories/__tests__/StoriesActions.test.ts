import { Chapter, Variant } from 'js-slang/dist/langs';
import { describe, expect, it } from 'vitest';

import StoriesActions from '../StoriesActions';

describe(StoriesActions.addStoryEnv.type, () => {
  it('generates correct action object', () => {
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
})

describe(StoriesActions.clearStoryEnv.type, () => {
  it('generates correct action object', () => {
    const action = StoriesActions.clearStoryEnv();
    expect(action).toEqual({
      type: StoriesActions.clearStoryEnv.type,
      payload: {
        env: undefined
      }
    });
  });

  it('generates correct action object with environment', () => {
    const action = StoriesActions.clearStoryEnv('default');
    expect(action).toEqual({
      type: StoriesActions.clearStoryEnv.type,
      payload: {
        env: 'default'
      }
    });
  });
})

describe(StoriesActions.evalStory.type, () => {
  it('generates correct action object', () => {
    const action = StoriesActions.evalStory('testEnv', '1;');
    expect(action).toEqual({
      type: StoriesActions.evalStory.type,
      payload: {
        env: 'testEnv',
        code: '1;'
      }
    });
  });
})
