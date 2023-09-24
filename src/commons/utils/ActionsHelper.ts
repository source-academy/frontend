import { ActionType } from 'typesafe-actions';

import * as CommonsActions from '../../commons/application/actions/CommonsActions';
import * as SessionActions from '../../commons/application/actions/SessionActions';
import * as FileSystemActions from '../../commons/fileSystem/FileSystemActions';
import * as AcademyActions from '../../features/academy/AcademyActions';
import * as AchievementActions from '../../features/achievement/AchievementActions';
import * as DashboardActions from '../../features/dashboard/DashboardActions';
import * as GitHubActions from '../../features/github/GitHubActions';
import * as GroundControlActions from '../../features/groundControl/GroundControlActions';
import * as PersistenceActions from '../../features/persistence/PersistenceActions';
import * as RemoteExecutionActions from '../../features/remoteExecution/RemoteExecutionActions';
import { sessionReducerActions } from '../redux/session/SessionsReducer';
import { storiesActions } from '../redux/stories/StoriesRedux';
import { allWorkspaceActions } from '../redux/workspace/AllWorkspacesRedux';
import { playgroundActions } from '../redux/workspace/playground/PlaygroundRedux';
import { sourcecastActions } from '../redux/workspace/sourceRecorder/SourcecastRedux';
import { sourcereelActions } from '../redux/workspace/sourceRecorder/SourcereelRedux';

export const actions = {
  ...AchievementActions,
  ...CommonsActions,
  ...DashboardActions,
  ...SessionActions,
  ...GitHubActions,
  ...GroundControlActions,
  ...AcademyActions,
  ...PersistenceActions,
  ...RemoteExecutionActions,
  ...FileSystemActions,
  ...playgroundActions,
  ...sessionReducerActions,
  ...sourcecastActions,
  ...sourcereelActions,
  ...storiesActions,
  ...allWorkspaceActions,
};

export type SourceActionType = ActionType<typeof actions>;
