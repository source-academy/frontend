import { defaultDashboard } from '../../../commons/application/ApplicationTypes';
import DashboardActions from '../DashboardActions';
import { DashboardReducer } from '../DashboardReducer';
import { DashboardState, GradingSummary } from '../DashboardTypes';

const gradingSummaryTest1: GradingSummary = {
  cols: [
    'group',
    'avenger',
    'ungradedMissions',
    'submittedMissions',
    'ungradedQuests',
    'submittedQuests'
  ],
  rows: [
    {
      group: 'Mock Group 1',
      avenger: 'John',
      ungradedMissions: 123,
      submittedMissions: 200,
      ungradedQuests: 100,
      submittedQuests: 117
    }
  ]
};

const gradingSummaryTest2: GradingSummary = {
  cols: [
    'group',
    'avenger',
    'ungradedMissions',
    'submittedMissions',
    'ungradedQuests',
    'submittedQuests'
  ],
  rows: [
    {
      group: 'Mock Group 2',
      avenger: 'Molly',
      ungradedMissions: 1232,
      submittedMissions: 205430,
      ungradedQuests: 345,
      submittedQuests: 11547
    },
    {
      group: 'Mock Group 3',
      avenger: 'Lenny',
      ungradedMissions: 1532,
      submittedMissions: 22200,
      ungradedQuests: 134500,
      submittedQuests: 6777
    }
  ]
};

test('UPDATE_GROUP_GRADING_SUMMARY initialises dashboard state', () => {
  const action = {
    type: DashboardActions.updateGroupGradingSummary.type,
    payload: gradingSummaryTest1
  } as const;

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

  const gradingSummaryPayload = gradingSummaryTest2;
  const action = {
    type: DashboardActions.updateGroupGradingSummary.type,
    payload: gradingSummaryPayload
  } as const;

  const result: DashboardState = DashboardReducer(newDefaultDashBoard, action);

  expect(result).toEqual({
    ...defaultDashboard,
    gradingSummary: gradingSummaryPayload
  });
});
