import * as actionTypes from '../actionTypes';
import { changeQueryString, generateLzString } from '../playground';

test('generateLzString generates correct action object', () => {
  const action = generateLzString();
  expect(action).toEqual({
    type: actionTypes.GENERATE_LZ_STRING
  });
});

test('changeQueryString generates correct action object', () => {
  const queryString = 'test-query-string';
  const action = changeQueryString(queryString);
  expect(action).toEqual({
    type: actionTypes.CHANGE_QUERY_STRING,
    payload: queryString
  });
});
