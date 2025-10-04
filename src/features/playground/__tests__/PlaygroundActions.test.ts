import { describe, expect, it } from 'vitest';
import PlaygroundActions from '../PlaygroundActions';

describe(PlaygroundActions.generateLzString.type, () => {
  it('generates correct action object', () => {
    const action = PlaygroundActions.generateLzString();
    expect(action).toEqual({
      type: PlaygroundActions.generateLzString.type,
      payload: {}
    });
  });
});

describe(PlaygroundActions.changeQueryString.type, () => {
  it('generates correct action object', () => {
    const queryString = 'test-query-string';
    const action = PlaygroundActions.changeQueryString(queryString);
    expect(action).toEqual({
      type: PlaygroundActions.changeQueryString.type,
      payload: queryString
    });
  });
});
