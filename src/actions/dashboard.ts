import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';

import { IGroupOverview } from '../components/dashboard/groupShape';

export const fetchGroupOverviews = () => action(actionTypes.FETCH_GROUP_OVERVIEWS);

export const updateGroupOverviews = (groupOverviews: IGroupOverview[]) =>
  action(actionTypes.UPDATE_GROUP_OVERVIEWS, groupOverviews);
