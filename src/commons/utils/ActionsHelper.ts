import * as CommonsActions from 'src/commons/application/actions/CommonsActions';
import * as InterpreterActions from 'src/commons/application/actions/InterpreterActions';
import * as SessionActions from 'src/commons/application/actions/SessionActions';
import * as CollabEditingActions from 'src/commons/collabEditing/CollabEditingActions';
import * as FileSystemActions from 'src/commons/fileSystem/FileSystemActions';
import * as WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import * as AcademyActions from 'src/features/academy/AcademyActions';
import * as AchievementActions from 'src/features/achievement/AchievementActions';
import * as DashboardActions from 'src/features/dashboard/DashboardActions';
import * as GitHubActions from 'src/features/github/GitHubActions';
import * as GroundControlActions from 'src/features/groundControl/GroundControlActions';
import * as PersistenceActions from 'src/features/persistence/PersistenceActions';
import * as PlaygroundActions from 'src/features/playground/PlaygroundActions';
import * as RemoteExecutionActions from 'src/features/remoteExecution/RemoteExecutionActions';
import * as SourcecastActions from 'src/features/sourceRecorder/sourcecast/SourcecastActions';
import * as SourceRecorderActions from 'src/features/sourceRecorder/SourceRecorderActions';
import * as SourcereelActions from 'src/features/sourceRecorder/sourcereel/SourcereelActions';
import * as StoriesActions from 'src/features/stories/StoriesActions';
import { ActionType } from 'typesafe-actions';

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
  ...GitHubActions,
  ...GroundControlActions,
  ...AcademyActions,
  ...PersistenceActions,
  ...RemoteExecutionActions,
  ...FileSystemActions,
  ...StoriesActions
};

export type SourceActionType = ActionType<typeof actions>;
