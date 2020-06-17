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
  const overviews: GradingSummary = [
    {
      leaderName: 'Billy',
      groupName: 'Test Group 1',
      ungradedMissions: 12,
      ungradedSidequests: 34,
      submittedMissions: 56,
      submittedSidequests: 78
    }
  ];
  const action = updateGroupGradingSummary(overviews);
  expect(action).toEqual({
    type: UPDATE_GROUP_GRADING_SUMMARY,
    payload: overviews
  });
});
