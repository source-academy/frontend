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
  TextArea
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { useResponsive } from 'src/commons/utils/Hooks';
import classes from 'src/styles/CourseConfig.module.scss';

import { UpdateCourseConfiguration } from '../../../../commons/application/types/SessionTypes';
import Markdown from '../../../../commons/Markdown';

export enum CourseHelpTextEditorTab {
  WRITE = 'WRITE',
  PREVIEW = 'PREVIEW'
}

type Props = {
  courseConfiguration: UpdateCourseConfiguration;
  setCourseConfiguration: (courseConfiguration: UpdateCourseConfiguration) => void;
};

const CourseConfigPanel: React.FC<Props> = props => {
  const { isMobileBreakpoint } = useResponsive();
  const [courseHelpTextSelectedTab, setCourseHelpTextSelectedTab] =
    React.useState<CourseHelpTextEditorTab>(CourseHelpTextEditorTab.WRITE);

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
    enableSourcecast,
    enableStories,
    enableLlmGrading,
    moduleHelpText,
    llmApiKey,
    llmModel,
    llmApiUrl,
    llmCourseLevelPrompt
  } = props.courseConfiguration;

  const writePanel = (
    <TextArea
      id="moduleHelpText"
      className={classes['input-textarea']}
      fill={true}
      value={moduleHelpText || ''}
      onChange={e =>
        props.setCourseConfiguration({
          ...props.courseConfiguration,
          moduleHelpText: e.target.value
        })
      }
    />
  );

  const previewPanel = (
    <div className={classes['input-markdown']}>
      <Markdown content={moduleHelpText || ''} openLinksInNewWindow />
    </div>
  );

  const onChangeTabs = React.useCallback(
    (
      newTabId: CourseHelpTextEditorTab,
      prevTabId: CourseHelpTextEditorTab,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }
      setCourseHelpTextSelectedTab(newTabId);
    },
    [setCourseHelpTextSelectedTab]
  );

  return (
    <div className={classes['course-configuration']}>
      <H2>{courseName}</H2>
      <H3>{courseShortName}</H3>
      <div className={classes.inputs}>
        <div className={classes.text}>
          <FormGroup
            helperText="Please enter the course name that will be used for course selection."
            inline={true}
            label="Course Name"
            labelFor="courseName"
          >
            <InputGroup
              id="courseName"
              defaultValue={courseName}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  courseName: e.target.value
                })
              }
            />
          </FormGroup>
          <FormGroup
            helperText="Please enter the course short name. This will be displayed on the top left."
            inline={true}
            label="Course Short Name"
            labelFor="courseShortName"
          >
            <InputGroup
              id="courseShortName"
              defaultValue={courseShortName}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  courseShortName: e.target.value
                })
              }
            />
          </FormGroup>
          <FormGroup
            helperText="Please enter the module help text that will be used in the course help dialog."
            inline={true}
            label="Module Help Text"
            labelFor="moduleHelpText"
          >
            <Tabs selectedTabId={courseHelpTextSelectedTab} onChange={onChangeTabs}>
              <Tab id={CourseHelpTextEditorTab.WRITE} title="Write" />
              <Tab id={CourseHelpTextEditorTab.PREVIEW} title="Preview" />
            </Tabs>
            {courseHelpTextSelectedTab === CourseHelpTextEditorTab.WRITE && writePanel}
            {courseHelpTextSelectedTab === CourseHelpTextEditorTab.PREVIEW && previewPanel}
          </FormGroup>
          <FormGroup
            helperText="Enter the Top XX students to be displayed on the Overall Leaderboard"
            inline={true}
            label="Top Leaderboard Display"
            labelFor="topLeaderboardDisplay"
          >
            <InputGroup
              id="topLeaderboardDisplay"
              value={String(topLeaderboardDisplay)}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  topLeaderboardDisplay: Number(e.target.value)
                })
              }
            />
          </FormGroup>
          <FormGroup
            helperText="Enter the Top XX students to be displayed on the Contest Leaderboard"
            inline={true}
            label="Top Contest Leaderboard Display"
            labelFor="topContestLeaderboardDisplay"
          >
            <InputGroup
              id="topContestLeaderboardDisplay"
              value={String(topContestLeaderboardDisplay)}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  topContestLeaderboardDisplay: Number(e.target.value)
                })
              }
            />
          </FormGroup>

          {enableLlmGrading && (
            <div className={classes['llm-grading-config']}>
              <Divider style={{ marginTop: '20px', marginBottom: '20px' }} />
              <h3>LLM Grading Configuration</h3>
              <FormGroup
                helperText="Please enter the LLM Model Name."
                inline={true}
                label="LLM Model Name"
                labelFor="llmModel"
              >
                <InputGroup
                  id="llmModel"
                  defaultValue={llmModel}
                  placeholder="e.g gpt-5-mini, gpt-4o"
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmModel: e.target.value
                    })
                  }
                />
              </FormGroup>
              <FormGroup
                helperText="Please enter the LLM API's Provider URL."
                inline={true}
                label="LLM Provider URL"
                labelFor="llmApiUrl"
              >
                <InputGroup
                  id="llmApiUrl"
                  defaultValue={llmApiUrl}
                  placeholder="e.g https://api.openai.com/v1"
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmApiUrl: e.target.value
                    })
                  }
                />
              </FormGroup>
              <FormGroup
                helperText="Please enter the LLM API Key. This key is encrypted and will not be viewable after."
                inline={true}
                label="LLM API Key"
                labelFor="llmApiKey"
              >
                <InputGroup
                  id="llmApiKey"
                  type="password"
                  defaultValue={llmApiKey}
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmApiKey: e.target.value
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
                            exclusively by triple pipes ("|||") with no spaces before or after the
                            pipes, and without any additional formatting, bullet points, or extra
                            text.
                            <br />
                            <br />
                            For example: "This is a good answer.|||This is a bad answer.|||This is a
                            great answer.
                          </code>
                        </div>
                      }
                      interactionKind="hover"
                      position={Position.TOP}
                    >
                      <Icon icon={IconNames.HELP} className={classes['llm-course-prompt-icon']} />
                    </Popover>
                  </span>
                }
                inline={true}
                label="LLM Course Prompt"
                labelFor="llmCoursePrompt"
              >
                <TextArea
                  id="llmCourseLevelPrompt"
                  className={classes['llm-prompt-input-textarea']}
                  fill={true}
                  placeholder="You are looking at a modified version of Javascript"
                  value={llmCourseLevelPrompt}
                  onChange={e =>
                    props.setCourseConfiguration({
                      ...props.courseConfiguration,
                      llmCourseLevelPrompt: e.target.value
                    })
                  }
                />
              </FormGroup>
            </div>
          )}
        </div>
        {!isMobileBreakpoint && <Divider />}
        <div className={classes.booleans}>
          <Switch
            checked={viewable}
            label="Viewable"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                viewable: (e.target as HTMLInputElement).checked
              })
            }
          />
          <Switch
            checked={enableGame}
            label="Enable Game"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableGame: (e.target as HTMLInputElement).checked
              })
            }
          />
          <Switch
            checked={enableAchievements}
            label="Enable Achievements"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableAchievements: (e.target as HTMLInputElement).checked
              })
            }
          />
          <Switch
            checked={enableSourcecast}
            label="Enable Sourcecast"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableSourcecast: (e.target as HTMLInputElement).checked
              })
            }
          />
          <Switch
            checked={enableStories}
            label="Enable Stories"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableStories: (e.target as HTMLInputElement).checked
              })
            }
          />
          <Switch
            checked={enableLlmGrading}
            label="Enable LLM Grading"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableLlmGrading: (e.target as HTMLInputElement).checked
              })
            }
          />
          <Switch
            checked={enableOverallLeaderboard}
            label="Enable Overall Leaderboard"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableOverallLeaderboard: (e.target as HTMLInputElement).checked
              })
            }
          />
          <Switch
            checked={enableContestLeaderboard}
            label="Enable Contest Leaderboard"
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                enableContestLeaderboard: (e.target as HTMLInputElement).checked
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CourseConfigPanel;
