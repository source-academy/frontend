import { ActionType } from 'typesafe-actions';

import * as CommonsActions from '../../commons/application/actions/CommonsActions';
import * as InterpreterActions from '../../commons/application/actions/InterpreterActions';
import * as SessionActions from '../../commons/application/actions/SessionActions';
import * as CollabEditingActions from '../../commons/collabEditing/CollabEditingActions';
import * as WorkspaceActions from '../../commons/workspace/WorkspaceActions';
import * as DashboardActions from '../../features/dashboard/DashboardActions';
import * as PlaygroundActions from '../../features/playground/PlaygroundActions';
import * as SourcecastActions from '../../features/sourcecast/SourcecastActions';
import * as SourcereelActions from '../../features/sourcereel/SourcereelActions';

import * as GameActions from '../../actions/game';
import * as MaterialActions from '../../actions/material';

export const actions = {
  ...CommonsActions,
  ...CollabEditingActions,
  ...DashboardActions,
  ...InterpreterActions,
  ...PlaygroundActions,
  ...SessionActions,
  ...SourcecastActions,
  ...SourcereelActions,
  ...WorkspaceActions,

  ...MaterialActions,
  ...GameActions
};

export type SourceActionType = ActionType<typeof actions>;
