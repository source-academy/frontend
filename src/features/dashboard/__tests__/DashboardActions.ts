import { fetchGroupOverviews, updateGroupOverviews } from '../DashboardActions';
import { FETCH_GROUP_OVERVIEWS, GroupOverview, UPDATE_GROUP_OVERVIEWS } from '../DashboardTypes';

test('fetchGroupOverviews generates correct action object', () => {
  const action = fetchGroupOverviews();
  expect(action).toEqual({
    type: FETCH_GROUP_OVERVIEWS
  });
});

test('updateGroupOverviews generates correct action object', () => {
  const overviews: GroupOverview[] = [
    {
      id: 1,
      avengerName: 'Billy',
      groupName: 'Test Group 1'
    }
  ];
  const action = updateGroupOverviews(overviews);
  expect(action).toEqual({
    type: UPDATE_GROUP_OVERVIEWS,
    payload: overviews
  });
});
