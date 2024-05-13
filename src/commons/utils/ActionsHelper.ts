import CommonsActions from '../../commons/application/actions/CommonsActions';
import InterpreterActions from '../../commons/application/actions/InterpreterActions';
import SessionActions from '../../commons/application/actions/SessionActions';
import CollabEditingActions from '../../commons/collabEditing/CollabEditingActions';
import * as FileSystemActions from '../../commons/fileSystem/FileSystemActions';
import SideContentActions from '../../commons/sideContent/SideContentActions';
import WorkspaceActions from '../../commons/workspace/WorkspaceActions';
import AcademyActions from '../../features/academy/AcademyActions';
import AchievementActions from '../../features/achievement/AchievementActions';
import DashboardActions from '../../features/dashboard/DashboardActions';
import GitHubActions from '../../features/github/GitHubActions';
import GroundControlActions from '../../features/groundControl/GroundControlActions';
import * as PersistenceActions from '../../features/persistence/PersistenceActions';
import PlaygroundActions from '../../features/playground/PlaygroundActions';
import RemoteExecutionActions from '../../features/remoteExecution/RemoteExecutionActions';
import SourcecastActions from '../../features/sourceRecorder/sourcecast/SourcecastActions';
import SourceRecorderActions from '../../features/sourceRecorder/SourceRecorderActions';
import SourcereelActions from '../../features/sourceRecorder/sourcereel/SourcereelActions';
import StoriesActions from '../../features/stories/StoriesActions';
import { ActionType } from './TypeHelper';

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
  ...StoriesActions,
  ...SideContentActions
};

export type SourceActionType = ActionType<typeof actions>;
