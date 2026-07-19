import {
  Divider,
  FormGroup,
  H2,
  H3,
  Icon,
  InputGroup,
  Popover,
  Position,
  Switch,
  Tab,
  Tabs,
  TextArea,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useResponsive } from 'src/commons/utils/Hooks';

import type { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import Markdown from '../../../commons/Markdown';

export enum CourseHelpTextEditorTab {
  WRITE = 'WRITE',
  PREVIEW = 'PREVIEW',
}

type Props = {
  courseConfiguration: UpdateCourseConfiguration;
  setCourseConfiguration: (courseConfiguration: UpdateCourseConfiguration) => void;
};

// Fixed-width label keeps every field's input aligned on a common left edge.
const fieldLabel = (text: React.ReactNode) => (
  <span className="inline-block w-60 text-right">{text}</span>
);

function CourseConfigPanel(props: Props) {
  const { isMobileBreakpoint } = useResponsive();
  const [courseHelpTextSelectedTab, setCourseHelpTextSelectedTab] =
    useState<CourseHelpTextEditorTab>(CourseHelpTextEditorTab.WRITE);

  const {
    courseName,
    courseShortName,
    viewable,
    enableGame,
    enableAchievements,
    enableOverallLeaderboard,
    enableContestLeaderboard,
    topLeaderboardDisplay,
    topContestLeaderboardDisplay,
    enableLlmGrading,
    moduleHelpText,
    llmApiKey,
    llmModel,
    llmApiUrl,
    llmCourseLevelPrompt,
  } = props.courseConfiguration;

  const writePanel = (
    <TextArea
      id="moduleHelpText"
      className="h-25"
      fill
      value={moduleHelpText || ''}
      onChange={e =>
        props.setCourseConfiguration({
          ...props.courseConfiguration,
          moduleHelpText: e.target.value,
        })
      }
    />
  );

  const previewPanel = (
    <div className="p-2.5 h-25 bg-[#f5f5f5] rounded overflow-auto">
      <Markdown content={moduleHelpText || ''} openLinksInNewWindow />
    </div>
  );

  const onChangeTabs = useCallback(
    (
      newTabId: CourseHelpTextEditorTab,
      prevTabId: CourseHelpTextEditorTab,
      event: React.MouseEvent<HTMLElement>,
    ) => {
      if (newTabId === prevTabId) {
        return;
      }
      setCourseHelpTextSelectedTab(newTabId);
    },
    [setCourseHelpTextSelectedTab],
  );

  return (
    <div>
      <H2>{courseName}</H2>
      <H3>{courseShortName}</H3>
      <div
        className={classNames(
          'flex max-w-225 w-full gap-x-6 mx-auto',
          isMobileBreakpoint ? 'flex-col' : 'flex-row',
        )}
      >
        <div>
          <FormGroup
            helperText="Please enter the course name that will be used for course selection."
            inline
            label={fieldLabel('Course Name')}
            labelFor="courseName"
          >
            <InputGroup
              id="courseName"
              defaultValue={courseName}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  courseName: e.target.value,
                })
              }
            />
          </FormGroup>
          <FormGroup
            helperText="Please enter the course short name. This will be displayed on the top left."
            inline
            label={fieldLabel('Course Short Name')}
            labelFor="courseShortName"
          >
            <InputGroup
              id="courseShortName"
              defaultValue={courseShortName}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  courseShortName: e.target.value,
                })
              }
            />
          </FormGroup>
          <FormGroup
            helperText="Please enter the module help text that will be used in the course help dialog."
            inline
            label={fieldLabel('Module Help Text')}
            labelFor="moduleHelpText"
          >
            <Tabs
              selectedTabId={courseHelpTextSelectedTab}
              onChange={onChangeTabs}
              className="ml-2"
            >
              <Tab id={CourseHelpTextEditorTab.WRITE} title="Write" />
              <Tab id={CourseHelpTextEditorTab.PREVIEW} title="Preview" />
            </Tabs>
            {courseHelpTextSelectedTab === CourseHelpTextEditorTab.WRITE && writePanel}
            {courseHelpTextSelectedTab === CourseHelpTextEditorTab.PREVIEW && previewPanel}
          </FormGroup>
          <FormGroup
            helperText="Enter the Top XX students to be displayed on the Overall Leaderboard"
            inline
            label={fieldLabel('Top Leaderboard Display')}
            labelFor="topLeaderboardDisplay"
          >
            <InputGroup
              id="topLeaderboardDisplay"
              value={String(topLeaderboardDisplay)}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  topLeaderboardDisplay: Number(e.target.value),
                })
              }
            />
          </FormGroup>
          <FormGroup
            helperText="Enter the Top XX students to be displayed on the Contest Leaderboard"
            inline
            label={fieldLabel('Top Contest Leaderboard Display')}
            labelFor="topContestLeaderboardDisplay"
          >
            <InputGroup
              id="topContestLeaderboardDisplay"
              value={String(topContestLeaderboardDisplay)}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  topContestLeaderboardDisplay: Number(e.target.value),
                })
              }
            />
          </FormGroup>

          {enableLlmGrading && (
            <>
              <Divider className="my-5" />
              <h3>LLM Grading Configuration</h3>
              <FormGroup
                helperText="Please enter the LLM Model Name."
                inline
                label={fieldLabel('LLM Model Name')}
                labelFor="llmModel"
              >
                <InputGroup
                  id="llmModel"
                  defaultValue={llmModel}
                  placeholder="e.g gpt-5-mini, gpt-4o"
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmModel: e.target.value,
                    })
                  }
                />
              </FormGroup>
              <FormGroup
                helperText="Please enter the LLM API's Provider URL."
                inline
                label={fieldLabel('LLM Provider URL')}
                labelFor="llmApiUrl"
              >
                <InputGroup
                  id="llmApiUrl"
                  defaultValue={llmApiUrl}
                  placeholder="e.g https://api.openai.com/v1"
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmApiUrl: e.target.value,
                    })
                  }
                />
              </FormGroup>
              <FormGroup
                helperText="Please enter the LLM API Key. This key is encrypted and will not be viewable after."
                inline
                label={fieldLabel('LLM API Key')}
                labelFor="llmApiKey"
              >
                <InputGroup
                  id="llmApiKey"
                  type="password"
                  defaultValue={llmApiKey}
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmApiKey: e.target.value,
                    })
                  }
                />
              </FormGroup>
              <FormGroup
                helperText={
                  <span>
                    Please enter the LLM prompt for this course. This is treated as the System
                    Prompt.
                    <Popover
                      content={
                        <div style={{ maxWidth: '48rem' }}>
                          <p>
                            This prompt is prepended to every single LLM Grading prompt as part of
                            the System Prompt
                          </p>

                          <p>
                            <b>Note: </b> You must specify the return format of the comments so that
                            comments can be parsed correctly. An example is given below:
                          </p>

                          <code>
                            Your output must include only the comment suggestions, separated
                            exclusively by triple pipes (&ldquo;|||&rdquo;) with no spaces before or
                            after the pipes, and without any additional formatting, bullet points,
                            or extra text.
                            <br />
                            <br />
                            For example: &ldquo;This is a good answer.|||This is a bad
                            answer.|||This is a great answer.&rdquo;
                          </code>
                        </div>
                      }
                      interactionKind="hover"
                      position={Position.TOP}
                    >
                      <Icon icon={IconNames.HELP} className="ml-1.5 cursor-help" />
                    </Popover>
                  </span>
                }
                inline
                label={fieldLabel('LLM Course Prompt')}
                labelFor="llmCoursePrompt"
              >
                <TextArea
                  id="llmCourseLevelPrompt"
                  className="h-75"
                  fill
                  placeholder="You are looking at a modified version of Javascript"
                  value={llmCourseLevelPrompt}
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmCourseLevelPrompt: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </>
          )}
        </div>
        {!isMobileBreakpoint && <Divider />}
        <div className={classNames('space-y-4', !isMobileBreakpoint && 'text-left')}>
          <Switch
            checked={viewable}
            label="Viewable"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                viewable: (e.target as HTMLInputElement).checked,
              })
            }
          />
          <Switch
            checked={enableGame}
            label="Enable Game"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableGame: (e.target as HTMLInputElement).checked,
              })
            }
          />
          <Switch
            checked={enableAchievements}
            label="Enable Achievements"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableAchievements: (e.target as HTMLInputElement).checked,
              })
            }
          />
          <Switch
            checked={enableLlmGrading}
            label="Enable LLM Grading"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableLlmGrading: (e.target as HTMLInputElement).checked,
              })
            }
          />
          <Switch
            checked={enableOverallLeaderboard}
            label="Enable Overall Leaderboard"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableOverallLeaderboard: (e.target as HTMLInputElement).checked,
              })
            }
          />
          <Switch
            checked={enableContestLeaderboard}
            label="Enable Contest Leaderboard"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableContestLeaderboard: (e.target as HTMLInputElement).checked,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default CourseConfigPanel;
