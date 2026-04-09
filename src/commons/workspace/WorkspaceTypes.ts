import type { CollabEditingAccess } from '@sourceacademy/sharedb-ace/types';
import type { Context } from 'js-slang';

import type {
  AllColsSortStates,
  GradingColumnVisibility
} from '../../features/grading/GradingTypes';
import type { SourcecastWorkspaceState } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import type { SourcereelWorkspaceState } from '../../features/sourceRecorder/sourcereel/SourcereelTypes';
import type { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import type { AutogradingResult, Testcase } from '../assessment/AssessmentTypes';
import type { HighlightedLines, Position } from '../editor/EditorTypes';
import type { UploadResult } from '../sideContent/content/SideContentUpload';

export const EVAL_SILENT = 'EVAL_SILENT';

export type WorkspaceLocation = keyof WorkspaceManagerState;
export type WorkspaceLocationsWithTools = Extract<WorkspaceLocation, 'playground' | 'sicp'>;

type AssessmentWorkspaceAttr = {
  readonly currentAssessment?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
};
type AssessmentWorkspaceState = AssessmentWorkspaceAttr & WorkspaceState;

type GradingWorkspaceAttr = {
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
  // TODO: The below should be a separate state
  // instead of using the grading workspace state
  readonly submissionsTableFilters: SubmissionsTableFilters;
  readonly columnVisiblity: GradingColumnVisibility;
  readonly requestCounter: number;
  readonly allColsSortStates: AllColsSortStates;
  readonly hasLoadedBefore: boolean;
};

type GradingWorkspaceState = GradingWorkspaceAttr & WorkspaceState;

type PlaygroundWorkspaceAttr = {
  readonly usingSubst: boolean;
  readonly usingCse: boolean;
  readonly usingUpload: boolean;
  readonly updateCse: boolean;
  readonly currentStep: number;
  readonly stepsTotal: number;
  readonly breakpointSteps: number[];
  readonly changepointSteps: number[];
};
export type PlaygroundWorkspaceState = PlaygroundWorkspaceAttr & WorkspaceState;

export type SicpWorkspaceState = PlaygroundWorkspaceState;

export type WorkspaceManagerState = {
  readonly assessment: AssessmentWorkspaceState;
  readonly grading: GradingWorkspaceState;
  readonly playground: PlaygroundWorkspaceState;
  readonly sourcecast: SourcecastWorkspaceState;
  readonly sourcereel: SourcereelWorkspaceState;
  readonly sicp: SicpWorkspaceState;
  readonly stories: StoriesWorkspaceState;
};

type StoriesWorkspaceAttr = {
  // TODO: Add stories workspace attributes
};
type StoriesWorkspaceState = StoriesWorkspaceAttr & WorkspaceState;

export type EditorTabState = {
  readonly filePath?: string;
  readonly value: string;
  readonly highlightedLines: HighlightedLines[];
  readonly breakpoints: string[];
  readonly newCursorPosition?: Position;
};

export type WorkspaceState = {
  readonly autogradingResults: AutogradingResult[];
  readonly context: Context;
  readonly isFolderModeEnabled: boolean;
  readonly activeEditorTabIndex: number | null;
  readonly editorTabs: EditorTabState[];
  readonly programPrependValue: string;
  readonly programPostpendValue: string;
  readonly editorSessionId: string;
  readonly sessionDetails: { docId: string; readOnly: boolean; owner: boolean } | null;
  readonly editorTestcases: Testcase[];
  readonly execTime: number;
  readonly isRunning: boolean;
  readonly isDebugging: boolean;
  readonly enableDebugging: boolean;
  readonly isEditorAutorun: boolean;
  readonly isEditorReadonly: boolean;
  readonly output: InterpreterOutput[];
  readonly externalLibrary: ExternalLibraryName;
  readonly replHistory: ReplHistory;
  readonly replValue: string;
  readonly hasTokenCounter: boolean;
  readonly tokenCount: integer;
  readonly customNotification: string;
  readonly sharedbConnected: boolean;
  readonly stepLimit: number;
  readonly globals: Array<[string, any]>;
  readonly debuggerContext: DebuggerContext;
  readonly lastDebuggerResult: any;
  readonly files: UploadResult;
  readonly updateUserRoleCallback: (id: string, newRole: CollabEditingAccess) => void;
};

type ReplHistory = {
  browseIndex: null | number; // [0, 49] if browsing, else null
  records: string[];
  originalValue: string;
};

export type DebuggerContext = {
  result: any;
  lastDebuggerResult: any;
  code: string;
  context: Context;
  workspaceLocation?: WorkspaceLocation;
};

export type SubmissionsTableFilters = {
  columnFilters: { id: string; value: unknown }[];
};

export type TeamFormationsTableFilters = {
  columnFilters: { id: string; value: unknown }[];
  globalFilter: string | null;
};
