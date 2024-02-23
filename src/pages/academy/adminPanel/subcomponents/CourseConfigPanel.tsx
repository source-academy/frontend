import {
  Divider,
  FormGroup,
  H2,
  H3,
  InputGroup,
  Switch,
  Tab,
  Tabs,
  TextArea
} from '@blueprintjs/core';
import React from 'react';
import { useResponsive } from 'src/commons/utils/Hooks';

import { UpdateCourseConfiguration } from '../../../../commons/application/types/SessionTypes';
import Markdown from '../../../../commons/Markdown';

export type CourseConfigPanelProps = OwnProps;

type OwnProps = {
  courseConfiguration: UpdateCourseConfiguration;
  setCourseConfiguration: (courseConfiguration: UpdateCourseConfiguration) => void;
};

export enum CourseHelpTextEditorTab {
  WRITE = 'WRITE',
  PREVIEW = 'PREVIEW'
}

export enum DefaultLlmPromptTab {
  WRITE = 'WRITE',
  PREVIEW = 'PREVIEW'
}

type ConfigInputProps = {
  label: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText: string;
  id: string;
};

const ConfigInput: React.FC<ConfigInputProps> = ({ label, value, onChange, helperText, id }) => (
  <FormGroup helperText={helperText} inline={true} label={label} labelFor={id}>
    <InputGroup id={id} value={value || ''} onChange={onChange} />
  </FormGroup>
);

type TabPanelProps = {
  selectedTabId: CourseHelpTextEditorTab | DefaultLlmPromptTab;
  onChange: (newTabId: CourseHelpTextEditorTab | DefaultLlmPromptTab) => void;
  tabs: {
    id: CourseHelpTextEditorTab | DefaultLlmPromptTab;
    title: string;
    panel: React.ReactNode;
  }[];
};

const TabPanel: React.FC<TabPanelProps> = ({ selectedTabId, onChange, tabs }) => (
  <Tabs
    selectedTabId={selectedTabId}
    onChange={newTabId => onChange(newTabId as CourseHelpTextEditorTab | DefaultLlmPromptTab)}
    className="module-help-text-tabs"
  >
    {tabs.map(tab => (
      <Tab id={tab.id.toString()} title={tab.title} key={tab.id.toString()} />
    ))}
    {tabs.map(tab => selectedTabId === tab.id && tab.panel)}
  </Tabs>
);

const CourseConfigPanel: React.FC<CourseConfigPanelProps> = props => {
  const { isMobileBreakpoint } = useResponsive();
  const [courseHelpTextSelectedTab, setCourseHelpTextSelectedTab] = React.useState<
    CourseHelpTextEditorTab | DefaultLlmPromptTab
  >(CourseHelpTextEditorTab.WRITE);

  const [defaultLlmPromptSelectedTab, setDefaultLlmPromptSelectedTab] = React.useState<
    CourseHelpTextEditorTab | DefaultLlmPromptTab
  >(DefaultLlmPromptTab.WRITE);

  const {
    courseName,
    courseShortName,
    viewable,
    enableGame,
    enableAchievements,
    enableSourcecast,
    enableStories,
    moduleHelpText,
    defaultLlmPrompt
  } = props.courseConfiguration;

  const onChangeTabs = React.useCallback(
    (newTabId: CourseHelpTextEditorTab | DefaultLlmPromptTab) => {
      if (newTabId === courseHelpTextSelectedTab) {
        return;
      }
      setCourseHelpTextSelectedTab(newTabId);
    },
    [courseHelpTextSelectedTab]
  );

  const onChangeTab = React.useCallback(
    (newTabId: CourseHelpTextEditorTab | DefaultLlmPromptTab) => {
      if (newTabId === defaultLlmPromptSelectedTab) {
        return;
      }
      setDefaultLlmPromptSelectedTab(newTabId);
    },
    [defaultLlmPromptSelectedTab]
  );

  return (
    <div className="course-configuration">
      <H2>{courseName}</H2>
      <H3>{courseShortName}</H3>
      <div className="inputs">
        <div className="text">
          <ConfigInput
            label="Course Name"
            value={courseName}
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                courseName: e.target.value
              })
            }
            helperText="Please enter the course name that will be used for course selection."
            id="courseName"
          />

          <ConfigInput
            label="Course Short Name"
            value={courseShortName}
            onChange={e =>
              props.setCourseConfiguration({
                ...props.courseConfiguration,
                courseShortName: e.target.value
              })
            }
            helperText="Please enter the course short name. This will be displayed on the top left."
            id="courseShortName"
          />

          <FormGroup
            helperText="Please enter the module help text that will be used in the course help dialog."
            inline={true}
            label="Module Help Text"
            labelFor="moduleHelpText"
          >
            <TabPanel
              selectedTabId={courseHelpTextSelectedTab}
              onChange={onChangeTabs}
              tabs={[
                {
                  id: CourseHelpTextEditorTab.WRITE,
                  title: 'Write',
                  panel: (
                    <TextArea
                      id="moduleHelpText"
                      className="input-textarea"
                      fill={true}
                      value={moduleHelpText || ''}
                      onChange={e =>
                        props.setCourseConfiguration({
                          ...props.courseConfiguration,
                          moduleHelpText: e.target.value
                        })
                      }
                    />
                  )
                },
                {
                  id: CourseHelpTextEditorTab.PREVIEW,
                  title: 'Preview',
                  panel: (
                    <div className="input-markdown">
                      <Markdown content={moduleHelpText || ''} openLinksInNewWindow />
                    </div>
                  )
                }
              ]}
            />
          </FormGroup>

          <FormGroup
            helperText="Please enter the default LLM prompt that will be used in this course"
            inline={true}
            label="Default LLM Prompt"
            labelFor="defaultLlmPrompt"
          >
            <TabPanel
              selectedTabId={defaultLlmPromptSelectedTab}
              onChange={onChangeTab}
              tabs={[
                {
                  id: DefaultLlmPromptTab.WRITE,
                  title: 'Write',
                  panel: (
                    <TextArea
                      id="defaultLlmPrompt"
                      className="input-textarea"
                      fill={true}
                      value={defaultLlmPrompt || ''}
                      onChange={e =>
                        props.setCourseConfiguration({
                          ...props.courseConfiguration,
                          defaultLlmPrompt: e.target.value
                        })
                      }
                    />
                  )
                },
                {
                  id: DefaultLlmPromptTab.PREVIEW,
                  title: 'Preview',
                  panel: (
                    <div className="input-markdown">
                      <Markdown content={defaultLlmPrompt || ''} openLinksInNewWindow />
                    </div>
                  )
                }
              ]}
            />
          </FormGroup>

          {/* ... Other inputs */}
        </div>
        {!isMobileBreakpoint && <Divider />}
        <div className="booleans">
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
        </div>
      </div>
    </div>
  );
};

export default CourseConfigPanel;
