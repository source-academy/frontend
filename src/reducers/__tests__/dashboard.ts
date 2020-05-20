import { UPDATE_GROUP_OVERVIEWS } from '../../actions/actionTypes';
import { IGroupOverview } from '../../components/dashboard/groupShape';
import { reducer } from '../dashboard';
import { defaultDashBoard, IDashBoardState } from '../states';

const groupOverviewsTest1: IGroupOverview[] = [
  {
    id: 1,
    avengerName: 'Billy',
    groupName: 'Test Group 1'
  }
];

const groupOverviewsTest2: IGroupOverview[] = [
  {
    id: 2,
    avengerName: 'Justin',
    groupName: 'Test Group 2'
  }
];

test('UPDATE_GROUP_OVERVIEWS works correctly in inserting group overviews', () => {
  const action = {
    type: UPDATE_GROUP_OVERVIEWS,
    payload: groupOverviewsTest1
  };

  const result: IDashBoardState = reducer(defaultDashBoard, action);

  expect(result).toEqual({
    ...defaultDashBoard,
    groupOverviews: groupOverviewsTest1
  });
});

test('UPDATE_GROUP_OVERVIEWS works correctly in updating group overviews', () => {
  const newDefaultDashBoard = {
    ...defaultDashBoard,
    groupOverviews: groupOverviewsTest1
  };

  const groupOverviewsPayload = [...groupOverviewsTest2, ...groupOverviewsTest1];
  const action = {
    type: UPDATE_GROUP_OVERVIEWS,
    payload: groupOverviewsPayload
  };

  const result: IDashBoardState = reducer(newDefaultDashBoard, action);

  expect(result).toEqual({
    ...defaultDashBoard,
    groupOverviews: groupOverviewsPayload
  });
});
