import { IconName } from '@blueprintjs/core';
import React from 'react';
import type JSXRuntime from 'react/jsx-runtime';
import type ReactDOM from 'react-dom';

import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';

export const NOTIFY_PROGRAM_EVALUATED = 'NOTIFY_PROGRAM_EVALUATED';

export enum SideContentType {
  autograder = 'autograder',
  briefing = 'briefing',
  contestVoting = 'contest_voting',
  contestLeaderboard = 'contest_leaderboard',
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
  envVisualizer = 'env_visualizer',
  files = 'files',
  grading = 'grading',
  introduction = 'introduction',
  module = 'module',
  questionOverview = 'question_overview',
  remoteExecution = 'remote_execution',
  missionMetadata = 'mission_metadata',
  mobileEditor = 'mobile_editor',
  mobileEditorRun = 'mobile_editor_run',
  sourcereel = 'sourcereel',
  substVisualizer = 'subst_visualiser',
  testcases = 'testcases',
  toneMatrix = 'tone_matrix',
  htmlDisplay = 'html_display'
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

export type SideContentState = {
  readonly moduleTabs: SideContentTab[];
  readonly alertedTabs: string[];
  addAlert: (id: string) => void;
  visitTab: (id: string) => void;
};

export type RawTab = (
  react: typeof React,
  reactDom: typeof ReactDOM,
  jsxRuntime: typeof JSXRuntime
) => ModuleSideContent;

/**
 * @property onChange A function that is called whenever the
 * active tab is changed by the user.
 *
 * @property tabs An array of SideContentTabs.
 *  The tabs will be rendered in order of the array.
 *  If this array is empty, no tabs will be rendered.
 */
export type SideContentBaseProps = DispatchProps & StateProps;

type DispatchProps = {
  // Optional due to uncontrolled tab component in EditingWorkspace
  onChange?: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;

  onAllTabsChanged?: () => void;
};

type StateProps = {
  tabs: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  workspaceLocation?: WorkspaceLocation;
};
