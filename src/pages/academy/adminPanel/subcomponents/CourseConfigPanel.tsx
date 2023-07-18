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
import * as React from 'react';
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

export enum DefaultPromptTab {
  WRITE = 'WRITE',
  PREVIEW = 'PREVIEW'
}

const CourseConfigPanel: React.FC<CourseConfigPanelProps> = props => {
  const { isMobileBreakpoint } = useResponsive();
  const [courseHelpTextSelectedTab, setCourseHelpTextSelectedTab] =
    React.useState<CourseHelpTextEditorTab>(CourseHelpTextEditorTab.WRITE);

  const [defaultPromptSelectedTab, setDefaultPromptSelectedTab] = React.useState<DefaultPromptTab>(
    DefaultPromptTab.WRITE
  );

  const {
    courseName,
    courseShortName,
    viewable,
    enableGame,
    enableAchievements,
    enableSourcecast,
    moduleHelpText,
    defaultPrompt
  } = props.courseConfiguration;

  const writePanel = (
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
  );

  const writePanel1 = (
    <TextArea
      id="defaultPrompt"
      className="input-textarea"
      fill={true}
      value={defaultPrompt || ''}
      onChange={e =>
        props.setCourseConfiguration({
          ...props.courseConfiguration,
          defaultPrompt: e.target.value
        })
      }
    />
  );

  const previewPanel = (
    <div className="input-markdown">
      <Markdown content={moduleHelpText || ''} openLinksInNewWindow />
    </div>
  );

  const previewPanel1 = (
    <div className="input-markdown">
      <Markdown content={defaultPrompt || ''} openLinksInNewWindow />
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

  const onChangeTab = React.useCallback(
    (
      newTabId: DefaultPromptTab,
      prevTabId: DefaultPromptTab,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }
      setDefaultPromptSelectedTab(newTabId);
    },
    [setDefaultPromptSelectedTab]
  );

  return (
    <div className="course-configuration">
      <H2>{courseName}</H2>
      <H3>{courseShortName}</H3>
      <div className="inputs">
        <div className="text">
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
            <Tabs
              selectedTabId={courseHelpTextSelectedTab}
              onChange={onChangeTabs}
              className="module-help-text-tabs"
            >
              <Tab id={CourseHelpTextEditorTab.WRITE} title="Write" />
              <Tab id={CourseHelpTextEditorTab.PREVIEW} title="Preview" />
            </Tabs>
            {courseHelpTextSelectedTab === CourseHelpTextEditorTab.WRITE && writePanel}
            {courseHelpTextSelectedTab === CourseHelpTextEditorTab.PREVIEW && previewPanel}
          </FormGroup>
          <FormGroup
            helperText="Please enter the default prompt that will be used in this course"
            inline={true}
            label="Default Prompt"
            labelFor="defaultPrompt"
          >
            <Tabs
              selectedTabId={defaultPromptSelectedTab}
              onChange={onChangeTab}
              className="default-propmt-tabs"
            >
              <Tab id={DefaultPromptTab.WRITE} title="Write" />
              <Tab id={DefaultPromptTab.PREVIEW} title="Preview" />
            </Tabs>
            {defaultPromptSelectedTab === DefaultPromptTab.WRITE && writePanel1}
            {defaultPromptSelectedTab === DefaultPromptTab.PREVIEW && previewPanel1}
          </FormGroup>
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
        </div>
      </div>
    </div>
  );
};

export default CourseConfigPanel;
