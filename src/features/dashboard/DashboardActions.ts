import { action } from 'typesafe-actions';

import * as actionTypes from '../../commons/application/types/ActionTypes';

import { GroupOverview } from './DashboardTypes';

export const fetchGroupOverviews = () => action(actionTypes.FETCH_GROUP_OVERVIEWS);

export const updateGroupOverviews = (groupOverviews: GroupOverview[]) =>
  action(actionTypes.UPDATE_GROUP_OVERVIEWS, groupOverviews);
