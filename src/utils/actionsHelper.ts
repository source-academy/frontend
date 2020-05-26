import { ActionType } from 'typesafe-actions';

import * as CommonsActions from 'src/commons/application/actions/CommonsActions';
import * as InterpreterActions from 'src/commons/application/actions/InterpreterActions';
import * as SessionActions from 'src/commons/application/actions/SessionActions';
import * as CollabEditingActions from 'src/commons/collabEditing/CollabEditingActions';
import * as WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import * as DashboardActions from 'src/features/dashboard/DashboardActions';
import * as PlaygroundActions from 'src/features/playground/PlaygroundActions';
import * as SourcecastActions from 'src/features/sourcecast/SourcecastActions';
import * as SourcereelActions from 'src/features/sourcereel/SourcereelActions';

import * as GameActions from 'src/actions/game';
import * as MaterialActions from 'src/actions/material';

const actions = {
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
