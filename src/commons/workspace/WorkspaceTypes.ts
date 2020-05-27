import { Context } from 'js-slang';

import { InterpreterOutput } from 'src/commons/application/ApplicationTypes';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import {
  AutogradingResult,
  Testcase
} from 'src/commons/assessment/AssessmentTypes';
import { Position } from 'src/commons/editor/EditorTypes';
import { SideContentType } from 'src/commons/sideContent/SideContentTypes';
import { SourcecastWorkspaceState } from 'src/features/sourcecast/SourcecastTypes';
import { SourcereelWorkspaceState } from 'src/features/sourcereel/SourcereelTypes';

/**
 * Used to differenciate between the sources of actions, as
 * two workspaces can work at the same time. To generalise this
 * or add more instances of `Workspace`s, one can add a string,
 * and call the actions with the respective string (taken
 * from the below enum).
 *
 * Note that the names must correspond with the name of the
 * object in IWorkspaceManagerState.
 */
export enum WorkspaceLocations {
  assessment = 'assessment',
  playground = 'playground',
  grading = 'grading',
  sourcecast = 'sourcecast',
  sourcereel = 'sourcereel'
}

export type WorkspaceLocation = keyof typeof WorkspaceLocations;

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
};
type GradingWorkspaceState = GradingWorkspaceAttr & WorkspaceState;

type PlaygroundWorkspaceAttr = {
  readonly usingSubst: boolean;
};
type PlaygroundWorkspaceState = PlaygroundWorkspaceAttr & WorkspaceState;

export type WorkspaceManagerState = {
  readonly assessment: AssessmentWorkspaceState;
  readonly grading: GradingWorkspaceState;
  readonly playground: PlaygroundWorkspaceState;
  readonly sourcecast: SourcecastWorkspaceState;
  readonly sourcereel: SourcereelWorkspaceState;
};

export type WorkspaceState = {
  readonly autogradingResults: AutogradingResult[];
  readonly breakpoints: string[];
  readonly context: Context;
  readonly editorPrepend: string;
  readonly editorReadonly: boolean;
  readonly editorSessionId: string;
  readonly editorValue: string | null;
  readonly editorPostpend: string;
  readonly editorTestcases: Testcase[];
  readonly editorHeight: number;
  readonly editorWidth: string;
  readonly execTime: number;
  readonly highlightedLines: number[][];
  readonly newCursorPosition?: Position;
  readonly isRunning: boolean;
  readonly isDebugging: boolean;
  readonly enableDebugging: boolean;
  readonly isEditorAutorun: boolean;
  readonly output: InterpreterOutput[];
  readonly externalLibrary: ExternalLibraryName;
  readonly replHistory: ReplHistory;
  readonly replValue: string;
  readonly sharedbAceInitValue: string;
  readonly sharedbAceIsInviting: boolean;
  readonly sideContentActiveTab: SideContentType;
  readonly sideContentHeight?: number;
  readonly websocketStatus: number;
  readonly globals: Array<[string, any]>;
};

type ReplHistory = {
  browseIndex: null | number; // [0, 49] if browsing, else null
  records: string[];
  originalValue: string;
};
