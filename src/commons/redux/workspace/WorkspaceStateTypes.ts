import { Context } from "js-slang/dist/types";
import { InterpreterOutput } from "src/commons/application/ApplicationTypes";
import { HighlightedLines, Position } from "src/commons/editor/EditorTypes";
import { DebuggerContext, SideContentTab, SideContentType } from "src/commons/sideContent/SideContentTypes";
import Constants from "src/commons/utils/Constants";
import { createContext } from "src/commons/utils/JsSlangHelper";

export type EditorTabState = {
  readonly filePath?: string;
  readonly value: string;
  readonly highlightedLines: HighlightedLines[];
  readonly breakpoints: string[];
  readonly newCursorPosition?: Position;
};

export type EditorState = {
  readonly activeEditorTabIndex: number | null;
  readonly editorSessionId: string;
  readonly editorTabs: EditorTabState[];

  readonly isEditorAutorun: boolean;
  readonly isEditorReadonly: boolean;
  readonly isFolderModeEnabled: boolean;
};

export const getDefaultEditorState = (defaultTabs: EditorTabState[] = []): EditorState => ({
  activeEditorTabIndex: 0,
  editorSessionId: '',
  editorTabs: defaultTabs,
  isEditorAutorun: false,
  isEditorReadonly: false,
  isFolderModeEnabled: false
});

export const defaultEditorValue = '// Type your program in here!';

export type ReplState = {
  readonly output: InterpreterOutput[];
  readonly replHistory: {
    readonly browseIndex: null | number; // [0, 49] if browsing, else null
    readonly records: string[];
    readonly originalValue: string;
  };
  readonly replValue: string;
};

export const defaultRepl: ReplState = {
  output: [],
  replHistory: {
    browseIndex: null,
    records: [],
    originalValue: ''
  },
  replValue: ''
};

export type SideContentState = {
  dynamicTabs: SideContentTab[];
  alerts: string[];
  selectedTabId?: SideContentType;
  height?: number;
};

export const defaultSideContent: SideContentState = {
  dynamicTabs: [],
  alerts: []
};

export type WorkspaceState = {
  readonly context: Context;
  readonly debuggerContext: DebuggerContext;

  readonly editorState: EditorState;
  readonly enableDebugging: boolean;
  readonly execTime: number;

  readonly globals: Array<[string, any]>;

  readonly hasUnsavedChanges: boolean;

  readonly isDebugging: boolean;
  readonly isRunning: boolean;

  readonly output: InterpreterOutput[];

  readonly programPrependValue: string;
  readonly programPostpendValue: string;
  readonly repl: ReplState;
  readonly sideContent: SideContentState;

  readonly sharedbConnected: boolean;
};

export const getDefaultWorkspaceState = (initialTabs: EditorTabState[] = []): WorkspaceState => ({
  context: createContext(Constants.defaultSourceChapter, [], {}, Constants.defaultSourceVariant),
  debuggerContext: {} as DebuggerContext,
  editorState: getDefaultEditorState(initialTabs),
  enableDebugging: true,
  execTime: 1000,
  hasUnsavedChanges: false,
  isDebugging: false,
  isRunning: false,
  globals: [],
  output: [],
  repl: defaultRepl,
  programPostpendValue: '',
  programPrependValue: '',
  sideContent: defaultSideContent,
  sharedbConnected: false
});
