import { action } from 'typesafe-actions';

import { BROWSE_MY_MISSIONS } from './MissionEditorTypes';

export const browseMyMissions = () => action(BROWSE_MY_MISSIONS);
