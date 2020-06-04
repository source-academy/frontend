import { action } from 'typesafe-actions';

import { FETCH_GROUP_OVERVIEWS, GroupOverview, UPDATE_GROUP_OVERVIEWS } from './DashboardTypes';

export const fetchGroupOverviews = () => action(FETCH_GROUP_OVERVIEWS);

export const updateGroupOverviews = (groupOverviews: GroupOverview[]) =>
  action(UPDATE_GROUP_OVERVIEWS, groupOverviews);
