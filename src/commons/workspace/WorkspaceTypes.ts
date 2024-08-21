import { Context, Result } from 'js-slang';

import { AllColsSortStates, GradingColumnVisibility } from '../../features/grading/GradingTypes';
import { SourcecastWorkspaceState } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SourcereelWorkspaceState } from '../../features/sourceRecorder/sourcereel/SourcereelTypes';
import { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { AutogradingResult, Testcase } from '../assessment/AssessmentTypes';
import { HighlightedLines, Position } from '../editor/EditorTypes';
import { UploadResult } from '../sideContent/content/SideContentUpload';

export const EVAL_SILENT = 'EVAL_SILENT';
export const UPDATE_LAST_DEBUGGER_RESULT = 'UPDATE_LAST_DEBUGGER_RESULT';
export const UPDATE_LAST_NON_DET_RESULT = 'UPDATE_LAST_NON_DET_RESULT';
export const TOGGLE_USING_UPLOAD = 'TOGGLE_USING_UPLOAD';
export const UPLOAD_FILES = 'UPLOAD_FILES';

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
  readonly sessionDetails: { docId: string; readOnly: boolean } | null;
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
  readonly lastNonDetResult: Result | null;
  readonly files: UploadResult;
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
