import { Context } from 'js-slang';
import { SourceError } from 'js-slang/dist/types';

import { WorkspaceLocation, WorkspaceLocations } from '../actions/workspaces';
import { Grading, GradingOverview } from '../components/academy/grading/gradingShape';
import { Announcement } from '../components/Announcements';
import {
  ExternalLibraryName,
  ExternalLibraryNames,
  IAssessment,
  IAssessmentOverview,
  ITestcase
} from '../components/assessment/assessmentShape';
import { HistoryHelper } from '../utils/history';
import { createContext } from '../utils/slangHelper';

export interface IState {
  readonly academy: IAcademyState;
  readonly application: IApplicationState;
  readonly playground: IPlaygroundState;
  readonly session: ISessionState;
  readonly workspaces: IWorkspaceManagerState;
}

export interface IAcademyState {
  readonly gameCanvas?: HTMLCanvasElement;
}

export interface IApplicationState {
  readonly title: string;
  readonly environment: ApplicationEnvironment;
}

export interface IPlaygroundState {
  readonly queryString?: string;
}

interface IAssessmentWorkspace extends IWorkspaceState {
  readonly currentAssessment?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
}

interface IGradingWorkspace extends IWorkspaceState {
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
}

export interface IPlaygroundWorkspace extends IWorkspaceState {
  readonly playgroundExternal: ExternalLibraryName;
}

export interface IWorkspaceManagerState {
  readonly assessment: IAssessmentWorkspace;
  readonly grading: IGradingWorkspace;
  readonly playground: IPlaygroundWorkspace;
}

export interface IWorkspaceState {
  readonly context: Context;
  readonly editorPrepend: string | null;
  readonly editorSessionId: string;
  readonly editorValue: string | null;
  readonly editorPostpend: string | null;
  readonly editorTestcases: ITestcase[];
  readonly editorHeight: number;
  readonly editorWidth: string;
  readonly breakpoints: string[];
  readonly highlightedLines: number[][];
  readonly isRunning: boolean;
  readonly isDebugging: boolean;
  readonly enableDebugging: boolean;
  readonly isEditorAutorun: boolean;
  readonly output: InterpreterOutput[];
  readonly replHistory: ReplHistory;
  readonly replValue: string;
  readonly sideContentActiveTab: number;
  readonly sideContentHeight?: number;
  readonly websocketStatus: number;
  readonly globals: Array<[string, any]>;
}

export interface ISessionState {
  readonly accessToken?: string;
  readonly assessmentOverviews?: IAssessmentOverview[];
  readonly assessments: Map<number, IAssessment>;
  readonly announcements?: Announcement[];
  readonly grade: number;
  readonly gradingOverviews?: GradingOverview[];
  readonly gradings: Map<number, Grading>;
  readonly historyHelper: HistoryHelper;
  readonly maxGrade: number;
  readonly maxXp: number;
  readonly refreshToken?: string;
  readonly role?: Role;
  readonly story?: Story;
  readonly name?: string;
  readonly xp: number;
}

type ReplHistory = {
  browseIndex: null | number; // [0, 49] if browsing, else null
  records: string[];
};

export const maxBrowseIndex = 50;

export type Story = {
  story: string;
  playStory: boolean;
};

/**
 * An output while the program is still being run in the interpreter. As a
 * result, there are no return values or SourceErrors yet. However, there could
 * have been calls to display (console.log) that need to be printed out.
 */
export type RunningOutput = {
  type: 'running';
  consoleLogs: string[];
};

/**
 * An output which reflects the program which the user had entered. Not a true
 * Output from the interpreter, but simply there to let he user know what had
 * been entered.
 */
export type CodeOutput = {
  type: 'code';
  value: string;
};

/**
 * An output which represents a program being run successfully, i.e. with a
 * return value at the end. A program can have either a return value, or errors,
 * but not both.
 */
export type ResultOutput = {
  type: 'result';
  value: any;
  consoleLogs: string[];
  runtime?: number;
  isProgram?: boolean;
};

/**
 * An output which represents a program being run unsuccessfully, i.e. with
 * errors at the end. A program can have either a return value, or errors, but
 * not both.
 */
export type ErrorOutput = {
  type: 'errors';
  errors: SourceError[];
  consoleLogs: string[];
};

export type InterpreterOutput = RunningOutput | CodeOutput | ResultOutput | ErrorOutput;

export enum ApplicationEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

export enum Role {
  Student = 'student',
  Staff = 'staff',
  Admin = 'admin'
}

/**
 * Defines what chapters are available for usage.
 * For external libraries, see externalLibraries.ts
 */
export const sourceChapters = [1, 2, 3, 4];
const latestSourceChapter = sourceChapters.slice(-1)[0];

const currentEnvironment = (): ApplicationEnvironment => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return ApplicationEnvironment.Development;
    case 'production':
      return ApplicationEnvironment.Production;
    default:
      return ApplicationEnvironment.Test;
  }
};

export const defaultAcademy: IAcademyState = {
  gameCanvas: undefined
};

export const defaultApplication: IApplicationState = {
  title: 'Cadet',
  environment: currentEnvironment()
};

export const defaultPlayground: IPlaygroundState = {};

export const defaultEditorValue = '// Type your program in here!';

/**
 * Create a default IWorkspaceState for 'resetting' a workspace.
 * Takes in parameters to set the js-slang library and chapter.
 *
 * @param location the location of the workspace, used for context
 */
export const createDefaultWorkspace = (location: WorkspaceLocation): IWorkspaceState => ({
  context: createContext<WorkspaceLocation>(latestSourceChapter, [], location),
  editorPrepend: '',
  editorSessionId: '',
  editorValue: location === WorkspaceLocations.playground ? defaultEditorValue : null,
  editorPostpend: '',
  editorTestcases: [],
  editorHeight: 150,
  editorWidth: '50%',
  breakpoints: [],
  highlightedLines: [],
  output: [],
  replHistory: {
    browseIndex: null,
    records: []
  },
  replValue: '',
  sideContentActiveTab: 0,
  websocketStatus: 0,
  globals: [],
  isEditorAutorun: false,
  isRunning: false,
  isDebugging: false,
  enableDebugging: true
});

export const defaultComments = 'Comments **here**. Use `markdown` if you ~~are cool~~ want!';

export const defaultWorkspaceManager: IWorkspaceManagerState = {
  assessment: {
    ...createDefaultWorkspace(WorkspaceLocations.assessment),
    currentAssessment: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false
  },
  grading: {
    ...createDefaultWorkspace(WorkspaceLocations.grading),
    currentSubmission: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false
  },
  playground: {
    ...createDefaultWorkspace(WorkspaceLocations.playground),
    playgroundExternal: ExternalLibraryNames.NONE
  }
};

export const defaultSession: ISessionState = {
  accessToken: undefined,
  announcements: [
    {
      author: 'Aministrator',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non tellus non ligula consectetur feugiat a at mauris. Ut sagittis, urna id suscipit dictum, ipsum diam sollicitudin enim, sed ultricies diam turpis vel libero. Maecenas finibus nisl ac lobortis ultricies. Integer molestie urna vitae nisi pharetra porttitor. Vestibulum massa diam, tristique quis ante a, posuere placerat magna. Pellentesque at lobortis purus, vitae imperdiet diam. Nulla eu rutrum neque. Aliquam efficitur consectetur ullamcorper. Pellentesque ultricies, diam ut vestibulum pellentesque, metus arcu laoreet ex, at mattis quam est non neque. Nam velit ipsum, posuere non porttitor commodo, lobortis in urna. Nulla facilisi. Donec mollis id nibh a luctus. Mauris vitae orci id velit pulvinar pellentesque non ut sapien. Curabitur eu consequat lorem. Proin pretium blandit scelerisque. Morbi ultricies, tellus non posuere pretium, felis sem convallis magna, ut sagittis elit felis et sem. Aliquam auctor suscipit condimentum. Nam posuere nulla dolor, in maximus risus feugiat vel. Phasellus vestibulum odio nec leo vehicula condimentum. Ut et semper libero. Cras fermentum mauris quis ex sodales, sit amet hendrerit augue lobortis. Maecenas eu dapibus enim, nec auctor est. Quisque quis erat erat. Curabitur sed rutrum felis, non venenatis diam. Fusce maximus rhoncus neque, in maximus velit semper eu. Fusce tempus lorem ut sodales pulvinar.',
      pinned: true
    }
  ],
  assessments: new Map<number, IAssessment>(),
  assessmentOverviews: undefined,
  grade: 0,
  gradingOverviews: undefined,
  gradings: new Map<number, Grading>(),
  historyHelper: {
    lastAcademyLocations: [null, null],
    lastGeneralLocations: [null, null]
  },
  maxGrade: 0,
  maxXp: 0,
  refreshToken: undefined,
  name: undefined,
  xp: 0
};

export const defaultState: IState = {
  academy: defaultAcademy,
  application: defaultApplication,
  playground: defaultPlayground,
  session: defaultSession,
  workspaces: defaultWorkspaceManager
};
