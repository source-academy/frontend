import { action } from 'typesafe-actions';

import * as actionTypes from 'src/commons/types/ActionTypes';

import { GroupOverview } from 'src/features/dashboard/DashboardTypes';

export const fetchGroupOverviews = () => action(actionTypes.FETCH_GROUP_OVERVIEWS);

export const updateGroupOverviews = (groupOverviews: GroupOverview[]) =>
  action(actionTypes.UPDATE_GROUP_OVERVIEWS, groupOverviews);
