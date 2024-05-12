import { IconName } from '@blueprintjs/core';

import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';

export enum SideContentType {
  autograder = 'autograder',
  briefing = 'briefing',
  contestVoting = 'contest_voting',
  cseMachine = 'cse_machine',
  dataVisualizer = 'data_visualizer',
  editorGrading = 'editor_grading',
  editorAutograder = 'editor_autograder',
  editorBriefing = 'editor_briefing',
  editorGlobalDeployment = 'editor_global_deployment',
  editorGlobalGraderDeployment = 'editor_global_grader_deployment',
  editorLocalDeployment = 'editor_local_deployment',
  editorLocalGraderDeployment = 'editor_local_grader_deployment',
  editorManageQuestion = 'editor_manage_question',
  editorQuestionOverview = 'editor_question_overview',
  editorQuestionTemplate = 'editor_question_template',
  folder = 'folder',
  grading = 'grading',
  introduction = 'introduction',
  module = 'module',
  popularVoteLeaderboard = 'popular_vote_leaderboard',
  questionOverview = 'question_overview',
  remoteExecution = 'remote_execution',
  scoreLeaderboard = 'score_leaderboard',
  missionMetadata = 'mission_metadata',
  mobileEditor = 'mobile_editor',
  mobileEditorRun = 'mobile_editor_run',
  sourcereel = 'sourcereel',
  substVisualizer = 'subst_visualiser',
  testcases = 'testcases',
  toneMatrix = 'tone_matrix',
  htmlDisplay = 'html_display',
  storiesRun = 'stories_run',
  upload = 'upload'
}

/**
 * @property label A string that will appear as the tooltip.
 *
 * @property iconName BlueprintJS IconName element, used to render the
 *   icon which will be displayed over the SideContent panel.
 *
 * @property body The element to be rendered in the SideContent panel
 *  when the tab is selected. If null, the panel will not be rendered.
 *
 * @property id A string/number that will be used as the tab ID and key.
 *  If id is undefined, id will be set to label by the renderTab function.
 *
 * @property disabled Set this property to true to disable a tab. The
 * corresponding tab label will still be rendered on hover, but the
 * tab will be greyed out and cannot be selected. Default value: false.
 */
export type SideContentTab = {
  label: string;
  iconName: IconName;
  body: JSX.Element | null;
  id?: SideContentType;
  disabled?: boolean;
};

/**
 * Used for modules that dynamically spawn when imported
 *
 * @property label A string that will appear as the tooltip.
 *
 * @property iconName BlueprintJS IconName element, used to render the
 *   icon which will be displayed over the SideContent panel.
 *
 * @property body The element to be rendered in the SideContent panel
 *  when the tab is selected.
 *
 * @property toSpawn function that returns boolean to determine if
 * side content tab should appear
 */
export type ModuleSideContent = {
  label: string;
  iconName: IconName;
  body: (props: any) => JSX.Element;
  toSpawn?: (context: DebuggerContext) => boolean;
};

export type NonStoryWorkspaceLocation = Exclude<WorkspaceLocation, 'stories'>;
export type StoryWorkspaceLocation = `stories.${string}`;
export type SideContentManagerState = Record<NonStoryWorkspaceLocation, SideContentState> & {
  stories: Record<string, SideContentState>;
};

/**
 * A SideContentLocation specifier is an extension of the WorkspaceLocation type
 * that includes a specification for story workspaces
 * Story Envs should be specified in the following format: ``stories.${env}``
 */
export type SideContentLocation = NonStoryWorkspaceLocation | StoryWorkspaceLocation;

export type SideContentState = {
  height?: number;
  dynamicTabs: SideContentTab[];
  alerts: string[];
  selectedTab?: SideContentType;
};

export type ChangeTabsCallback = (
  newId: SideContentType,
  oldId: SideContentType,
  event: React.MouseEvent<HTMLElement>
) => void;

export type SideContentDispatchProps = {
  /**
   * Call this function to cause the icon of the tab with the provided ID to flash
   */
  alertSideContent: (newId: SideContentType) => void;
};
