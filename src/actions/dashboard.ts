import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';

export const fetchGroupsInfo = () => action(actionTypes.FETCH_GROUPS_INFO);

export const updateGroupsInfo = (groupsInfo: object) =>
  action(actionTypes.UPDATE_GROUPS_INFO, groupsInfo);
