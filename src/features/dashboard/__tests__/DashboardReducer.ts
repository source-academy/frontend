import { defaultDashBoard } from '../../../commons/application/ApplicationTypes';
import { DashboardReducer } from '../DashboardReducer';
import { DashBoardState, UPDATE_GROUP_OVERVIEWS } from '../DashboardTypes';
import { GroupOverview } from '../DashboardTypes';

const groupOverviewsTest1: GroupOverview[] = [
  {
    id: 1,
    avengerName: 'Billy',
    groupName: 'Test Group 1'
  }
];

const groupOverviewsTest2: GroupOverview[] = [
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

  const result: DashBoardState = DashboardReducer(defaultDashBoard, action);

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

  const result: DashBoardState = DashboardReducer(newDefaultDashBoard, action);

  expect(result).toEqual({
    ...defaultDashBoard,
    groupOverviews: groupOverviewsPayload
  });
});
