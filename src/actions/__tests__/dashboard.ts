import { IGroupOverview } from '../../components/dashboard/groupShape';
import * as actionTypes from '../actionTypes';
import { fetchGroupOverviews, updateGroupOverviews } from '../dashboard';

test('fetchGroupOverviews generates correct action object', () => {
  const action = fetchGroupOverviews();
  expect(action).toEqual({
    type: actionTypes.FETCH_GROUP_OVERVIEWS
  });
});

test('updateGroupOverviews generates correct action object', () => {
  const overviews: IGroupOverview[] = [
    {
      id: 1,
      avengerName: 'Billy',
      groupName: 'Test Group 1'
    }
  ];
  const action = updateGroupOverviews(overviews);
  expect(action).toEqual({
    type: actionTypes.UPDATE_GROUP_OVERVIEWS,
    payload: overviews
  });
});
