import type { CollabEditingAccess } from '@sourceacademy/sharedb-ace/types';

import { createActions } from '../redux/utils';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';

const CollabEditingActions = createActions('collabEditing', {
  setEditorSessionId: (workspaceLocation: WorkspaceLocation, editorSessionId: string) => ({
    workspaceLocation,
    editorSessionId
  }),
  setSessionDetails: (
    workspaceLocation: WorkspaceLocation,
    sessionDetails: { docId?: string; readOnly?: boolean; owner?: boolean } | null
  ) => ({ workspaceLocation, sessionDetails }),
  /**
   * Sets ShareDB connection status.
   *
   * @param workspaceLocation the workspace to be reset
   * @param connected whether we are connected to ShareDB
   */
  setSharedbConnected: (workspaceLocation: WorkspaceLocation, connected: boolean) => ({
    workspaceLocation,
    connected
  }),
  setUpdateUserRoleCallback: (
    workspaceLocation: WorkspaceLocation,
    updateUserRoleCallback: (id: string, newRole: CollabEditingAccess) => void
  ) => ({
    workspaceLocation,
    updateUserRoleCallback
  })
});

// For compatibility with existing code (reducer)
export const {
  setEditorSessionId,
  setSessionDetails,
  setSharedbConnected,
  setUpdateUserRoleCallback
} = CollabEditingActions;

// For compatibility with existing code (actions helper)
export default CollabEditingActions;
