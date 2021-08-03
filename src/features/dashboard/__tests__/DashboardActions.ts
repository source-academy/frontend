import { fetchGroupGradingSummary, updateGroupGradingSummary } from '../DashboardActions';
import {
  FETCH_GROUP_GRADING_SUMMARY,
  GradingSummary,
  UPDATE_GROUP_GRADING_SUMMARY
} from '../DashboardTypes';

test('fetchGroupGradingSummary generates correct action object', () => {
  const action = fetchGroupGradingSummary();
  expect(action).toEqual({
    type: FETCH_GROUP_GRADING_SUMMARY
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
  const action = updateGroupGradingSummary(overviews);
  expect(action).toEqual({
    type: UPDATE_GROUP_GRADING_SUMMARY,
    payload: overviews
  });
});
