import { IconName } from '@blueprintjs/core';

import { DebuggerContext } from '../workspace/WorkspaceTypes';

export const NOTIFY_PROGRAM_EVALUATED = 'NOTIFY_PROGRAM_EVALUATED';

export enum SideContentType {
  autograder = 'autograder',
  briefing = 'briefing',
  dataVisualiser = 'data_visualiser',
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
  envVisualiser = 'env_visualiser',
  grading = 'grading',
  introduction = 'introduction',
  inspector = 'inspector',
  questionOverview = 'question_overview',
  remoteExecution = 'remote_execution',
  sourcereel = 'sourcereel',
  substVisualizer = 'subst_visualiser',
  toneMatrix = 'tone_matrix',
  videoDisplay = 'video_display'
}

/**
 * @property label A string that will appear as the tooltip.
 *
 * @property iconName BlueprintJS IconName element, used to render the
 *   icon which will be displayed over the SideContent panel.
 *
 * @property body The element to be rendered in the SideContent panel
 *  when the tab is selected.
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
  body: JSX.Element;
  toSpawn: (context: DebuggerContext) => boolean;
  id?: SideContentType;
  disabled?: boolean;
};
