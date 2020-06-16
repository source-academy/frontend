import { defaultDashboard } from '../../../commons/application/ApplicationTypes';
import { DashboardReducer } from '../DashboardReducer';
import { DashboardState, UPDATE_GROUP_GRADING_SUMMARY } from '../DashboardTypes';
import { GradingSummary } from '../DashboardTypes';

const gradingSummaryTest1: GradingSummary = [
  {
    leaderName: 'Billy',
    groupName: 'Test Group 1',
    ungradedMissions: 12,
    ungradedSidequests: 34,
    submittedMissions: 56,
    submittedSidequests: 78
  }
];

const gradingSummaryTest2: GradingSummary = [
  {
    leaderName: 'Justin',
    groupName: 'Test Group 2',
    ungradedMissions: 312,
    ungradedSidequests: 434,
    submittedMissions: 556,
    submittedSidequests: 678
  }
];

test('UPDATE_GROUP_GRADING_SUMMARY initialises dashboard state', () => {
  const action = {
    type: UPDATE_GROUP_GRADING_SUMMARY,
    payload: gradingSummaryTest1
  };

  const result: DashboardState = DashboardReducer(defaultDashboard, action);

  expect(result).toEqual({
    ...defaultDashboard,
    gradingSummary: gradingSummaryTest1
  });
});

test('UPDATE_GROUP_GRADING_SUMMARY updates dashboard state', () => {
  const newDefaultDashBoard = {
    ...defaultDashboard,
    gradingSummary: gradingSummaryTest1
  };

  const gradingSummaryPayload = [...gradingSummaryTest1, ...gradingSummaryTest2];
  const action = {
    type: UPDATE_GROUP_GRADING_SUMMARY,
    payload: gradingSummaryPayload
  };

  const result: DashboardState = DashboardReducer(newDefaultDashBoard, action);

  expect(result).toEqual({
    ...defaultDashboard,
    gradingSummary: gradingSummaryPayload
  });
});
