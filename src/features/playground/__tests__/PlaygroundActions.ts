import { changeQueryString, generateLzString } from '../PlaygroundActions';
import { CHANGE_QUERY_STRING, GENERATE_LZ_STRING } from '../PlaygroundTypes';

test('generateLzString generates correct action object', () => {
  const action = generateLzString();
  expect(action).toEqual({
    type: GENERATE_LZ_STRING
  });
});

test('changeQueryString generates correct action object', () => {
  const queryString = 'test-query-string';
  const action = changeQueryString(queryString);
  expect(action).toEqual({
    type: CHANGE_QUERY_STRING,
    payload: queryString
  });
});
