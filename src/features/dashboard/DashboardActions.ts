import { createActions } from 'src/commons/redux/utils';

import { GradingSummary } from './DashboardTypes';

const DashboardActions = createActions('dashboard', {
  fetchGroupGradingSummary: () => ({}),
  updateGroupGradingSummary: (gradingSummary: GradingSummary) => gradingSummary
});

// For compatibility with existing code (reducer)
export const { fetchGroupGradingSummary, updateGroupGradingSummary } = DashboardActions;

// For compatibility with existing code (actions helper)
export default DashboardActions;
