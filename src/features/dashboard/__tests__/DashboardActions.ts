import DashboardActions from '../DashboardActions';
import { GradingSummary } from '../DashboardTypes';

test('fetchGroupGradingSummary generates correct action object', () => {
  const action = DashboardActions.fetchGroupGradingSummary();
  expect(action).toEqual({
    type: DashboardActions.fetchGroupGradingSummary.type,
    payload: {}
  });
});

test('updateGroupGradingSummary generates correct action object', () => {
  const overviews: GradingSummary = {
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
  const action = DashboardActions.updateGroupGradingSummary(overviews);
  expect(action).toEqual({
    type: DashboardActions.updateGroupGradingSummary.type,
    payload: overviews
  });
});
