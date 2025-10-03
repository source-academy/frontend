import { describe, expect, it } from 'vitest';
import CommonsActions from '../CommonsActions';

describe(CommonsActions.logOut.type, () => {
  it('generates correct action object', () => {
    const action = CommonsActions.logOut();
    expect(action).toEqual({
      type: CommonsActions.logOut.type,
      payload: {}
    });
  });
});
