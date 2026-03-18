import type { Context } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/types';

import type {
  AllColsSortStates,
  GradingColumnVisibility
} from '../../features/grading/GradingTypes';
import type { SALanguage } from '../application/ApplicationTypes';
import type { ExternalLibraryName } from '../application/types/ExternalTypes';
import type { Library } from '../assessment/AssessmentTypes';
import type { HighlightedLines, Position } from '../editor/EditorTypes';
import { createActions } from '../redux/utils';
import type { UploadResult } from '../sideContent/content/SideContentUpload';
import type {
  EditorTabState,
  SubmissionsTableFilters,
  WorkspaceLocation,
  WorkspaceLocationsWithTools,
  WorkspaceState
} from './WorkspaceTypes';

const newActions = createActions('workspace', {
  setTokenCount: (workspaceLocation: WorkspaceLocation, tokenCount: number) => ({
    workspaceLocation,
    tokenCount
  }),
  browseReplHistoryDown: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  browseReplHistoryUp: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  changeExternalLibrary: (
    newExternal: ExternalLibraryName,
    workspaceLocation: WorkspaceLocation
  ) => ({ newExternal, workspaceLocation }),
  changeExecTime: (execTime: number, workspaceLocation: WorkspaceLocation) => ({
    execTime,
    workspaceLocation
  }),
  changeStepLimit: (stepLimit: number, workspaceLocation: WorkspaceLocation) => ({
    stepLimit,
    workspaceLocation
  }),
  chapterSelect: (chapter: Chapter, variant: Variant, workspaceLocation: WorkspaceLocation) => ({
    chapter,
    variant,
    workspaceLocation
  }),
  externalLibrarySelect: (
    externalLibraryName: ExternalLibraryName,
    workspaceLocation: WorkspaceLocation,
    initialise?: boolean
  ) => ({ externalLibraryName, workspaceLocation, initialise: initialise || false }),
  toggleEditorAutorun: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  /**
   * Starts the process to clear the js-slang Context
   * at a specified workspace location.
   *
   * This action is to be handled by saga, in order to
   * call upon side effects such as loading libraries in
   * the global scope.
   *
   * @param library the Library that the context shall be using
   * @param workspaceLocation the location of the workspace
   *
   * @see Library in assessmentShape.ts
   */
  beginClearContext: (
    workspaceLocation: WorkspaceLocation,
    library: Library,
    shouldInitLibrary: boolean
  ) => ({ library, workspaceLocation, shouldInitLibrary }),
  clearReplInput: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  clearReplOutput: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  clearReplOutputLast: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  /**
   * Finishes the process to clear the js-slang Context
   * at a specified workspace location.
   *
   * This action is to be handled in the reducer, to call the reset on the
   * Context in the state.
   *
   * @param library the Library that the context shall be using
   * @param workspaceLocation the location of the workspace
   *
   * @see Library in assessmentShape.ts
   */
  endClearContext: (library: Library, workspaceLocation: WorkspaceLocation) => ({
    library,
    workspaceLocation
  }),
  evalEditor: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  evalRepl: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  evalTestcase: (workspaceLocation: WorkspaceLocation, testcaseId: number) => ({
    workspaceLocation,
    testcaseId
  }),
  runAllTestcases: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  toggleFolderMode: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  enableTokenCounter: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  disableTokenCounter: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  setFolderMode: (workspaceLocation: WorkspaceLocation, isFolderModeEnabled: boolean) => ({
    workspaceLocation,
    isFolderModeEnabled
  }),
  updateActiveEditorTabIndex: (
    workspaceLocation: WorkspaceLocation,
    activeEditorTabIndex: number | null
  ) => ({ workspaceLocation, activeEditorTabIndex }),
  updateActiveEditorTab: (
    workspaceLocation: WorkspaceLocation,
    activeEditorTabOptions?: Partial<EditorTabState>
  ) => ({ workspaceLocation, activeEditorTabOptions }),
  updateEditorValue: (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newEditorValue: string
  ) => ({ workspaceLocation, editorTabIndex, newEditorValue }),
  setEditorBreakpoint: (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newBreakpoints: string[]
  ) => ({ workspaceLocation, editorTabIndex, newBreakpoints }),
  setEditorHighlightedLines: (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => ({ workspaceLocation, editorTabIndex, newHighlightedLines }),
  setEditorHighlightedLinesControl: (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => ({ workspaceLocation, editorTabIndex, newHighlightedLines }),
  moveCursor: (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newCursorPosition: Position
  ) => ({ workspaceLocation, editorTabIndex, newCursorPosition }),
  addEditorTab: (workspaceLocation: WorkspaceLocation, filePath: string, editorValue: string) => ({
    workspaceLocation,
    filePath,
    editorValue
  }),
  shiftEditorTab: (
    workspaceLocation: WorkspaceLocation,
    previousEditorTabIndex: number,
    newEditorTabIndex: number
  ) => ({ workspaceLocation, previousEditorTabIndex, newEditorTabIndex }),
  removeEditorTab: (workspaceLocation: WorkspaceLocation, editorTabIndex: number) => ({
    workspaceLocation,
    editorTabIndex
  }),
  removeEditorTabForFile: (workspaceLocation: WorkspaceLocation, removedFilePath: string) => ({
    workspaceLocation,
    removedFilePath
  }),
  removeEditorTabsForDirectory: (
    workspaceLocation: WorkspaceLocation,
    removedDirectoryPath: string
  ) => ({ workspaceLocation, removedDirectoryPath }),
  renameEditorTabForFile: (
    workspaceLocation: WorkspaceLocation,
    oldFilePath: string,
    newFilePath: string
  ) => ({ workspaceLocation, oldFilePath, newFilePath }),
  renameEditorTabsForDirectory: (
    workspaceLocation: WorkspaceLocation,
    oldDirectoryPath: string,
    newDirectoryPath: string
  ) => ({ workspaceLocation, oldDirectoryPath, newDirectoryPath }),
  updateReplValue: (newReplValue: string, workspaceLocation: WorkspaceLocation) => ({
    newReplValue,
    workspaceLocation
  }),
  sendReplInputToOutput: (newOutput: string, workspaceLocation: WorkspaceLocation) => ({
    type: 'code',
    workspaceLocation,
    value: newOutput
  }),
  resetTestcase: (workspaceLocation: WorkspaceLocation, index: number) => ({
    workspaceLocation,
    index
  }),
  navigateToDeclaration: (workspaceLocation: WorkspaceLocation, cursorPosition: Position) => ({
    workspaceLocation,
    cursorPosition
  }),
  /**
   * Resets a workspace to its default properties.
   *
   * @param workspaceLocation the workspace to be reset
   * @param workspaceOptions an object with any number of properties
   *   in IWorkspaceState, that will take precedence over the default
   *   values. For example, one can use this to specify a particular
   *   editorValue.
   */
  resetWorkspace: (
    workspaceLocation: WorkspaceLocation,
    workspaceOptions?: Partial<WorkspaceState>
  ) => ({ workspaceLocation, workspaceOptions }),
  updateWorkspace: (
    workspaceLocation: WorkspaceLocation,
    workspaceOptions?: Partial<WorkspaceState>
  ) => ({ workspaceLocation, workspaceOptions }),
  setIsEditorReadonly: (workspaceLocation: WorkspaceLocation, isEditorReadonly: boolean) => ({
    workspaceLocation,
    isEditorReadonly
  }),
  updateSubmissionsTableFilters: (filters: SubmissionsTableFilters) => ({ filters }),
  updateCurrentAssessmentId: (assessmentId: number, questionId: number) => ({
    assessmentId,
    questionId
  }),
  updateCurrentSubmissionId: (submissionId: number, questionId: number) => ({
    submissionId,
    questionId
  }),
  updateHasUnsavedChanges: (workspaceLocation: WorkspaceLocation, hasUnsavedChanges: boolean) => ({
    workspaceLocation,
    hasUnsavedChanges
  }),
  changeSublanguage: (sublang: SALanguage) => ({ sublang }),
  updateSublanguage: (sublang: SALanguage) => ({ sublang }),
  promptAutocomplete: (
    workspaceLocation: WorkspaceLocation,
    row: number,
    column: number,
    callback: any // TODO: define a type for this
  ) => ({ workspaceLocation, row, column, callback }),
  notifyProgramEvaluated: (
    result: any,
    lastDebuggerResult: any,
    code: string,
    context: Context,
    workspaceLocation?: WorkspaceLocation
  ) => ({ result, lastDebuggerResult, code, context, workspaceLocation }),
  toggleUsingSubst: (usingSubst: boolean, workspaceLocation: WorkspaceLocationsWithTools) => ({
    usingSubst,
    workspaceLocation
  }),
  addHtmlConsoleError: (
    errorMsg: string,
    workspaceLocation: WorkspaceLocation,
    storyEnv?: string
  ) => ({ errorMsg, workspaceLocation, storyEnv }),
  showMcqPane: (workspaceLocation: WorkspaceLocation, options: string[]) => ({
    workspaceLocation,
    options
  }),
  toggleUsingCse: (usingCse: boolean, workspaceLocation: WorkspaceLocationsWithTools) => ({
    usingCse,
    workspaceLocation
  }),
  toggleUpdateCse: (updateCse: boolean, workspaceLocation: WorkspaceLocationsWithTools) => ({
    updateCse,
    workspaceLocation
  }),
  toggleUsingUpload: (usingUpload: boolean, workspaceLocation: WorkspaceLocationsWithTools) => ({
    usingUpload,
    workspaceLocation
  }),
  updateCurrentStep: (steps: number, workspaceLocation: WorkspaceLocation) => ({
    steps,
    workspaceLocation
  }),
  updateStepsTotal: (steps: number, workspaceLocation: WorkspaceLocation) => ({
    steps,
    workspaceLocation
  }),
  updateBreakpointSteps: (breakpointSteps: number[], workspaceLocation: WorkspaceLocation) => ({
    breakpointSteps,
    workspaceLocation
  }),
  updateChangePointSteps: (changepointSteps: number[], workspaceLocation: WorkspaceLocation) => ({
    changepointSteps,
    workspaceLocation
  }),
  updateLastDebuggerResult: (lastDebuggerResult: any, workspaceLocation: WorkspaceLocation) => ({
    lastDebuggerResult,
    workspaceLocation
  }),
  uploadFiles: (files: UploadResult, workspaceLocation: WorkspaceLocation) => ({
    files,
    workspaceLocation
  }),
  // For grading table
  increaseRequestCounter: 0,
  decreaseRequestCounter: 0,
  setGradingHasLoadedBefore: () => true,
  updateAllColsSortStates: (sortStates: AllColsSortStates) => ({ sortStates }),
  updateGradingColumnVisibility: (filters: GradingColumnVisibility) => ({ filters })
});

export default newActions;
