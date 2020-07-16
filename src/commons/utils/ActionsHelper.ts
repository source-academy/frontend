import { ActionType } from 'typesafe-actions';

import * as CommonsActions from '../../commons/application/actions/CommonsActions';
import * as InterpreterActions from '../../commons/application/actions/InterpreterActions';
import * as SessionActions from '../../commons/application/actions/SessionActions';
import * as CollabEditingActions from '../../commons/collabEditing/CollabEditingActions';
import * as WorkspaceActions from '../../commons/workspace/WorkspaceActions';
import * as AcademyActions from '../../features/academy/AcademyActions';
import * as DashboardActions from '../../features/dashboard/DashboardActions';
import * as GroundControlActions from '../../features/groundControl/GroundControlActions';
import * as PersistenceActions from '../../features/persistence/PersistenceActions';
import * as PlaygroundActions from '../../features/playground/PlaygroundActions';
import * as SourcecastActions from '../../features/sourceRecorder/sourcecast/SourcecastActions';
import * as SourceRecorderActions from '../../features/sourceRecorder/SourceRecorderActions';
import * as SourcereelActions from '../../features/sourceRecorder/sourcereel/SourcereelActions';
import * as AchievementActions from '../achievement/AchievementActions';

export const actions = {
  ...AchievementActions,
  ...CommonsActions,
  ...CollabEditingActions,
  ...DashboardActions,
  ...InterpreterActions,
  ...PlaygroundActions,
  ...SessionActions,
  ...SourcecastActions,
  ...SourceRecorderActions,
  ...SourcereelActions,
  ...WorkspaceActions,
  ...GroundControlActions,
  ...AcademyActions,
  ...PersistenceActions
};

export type SourceActionType = ActionType<typeof actions>;
