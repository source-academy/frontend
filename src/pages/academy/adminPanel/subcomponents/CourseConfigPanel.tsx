import {
  Button,
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
import Constants from 'src/commons/utils/Constants';
import { useLocalStorageState, useResponsive } from 'src/commons/utils/Hooks';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';

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
  const [isPreviewExamMode, setIsPreviewExamMode] = useLocalStorageState(
    Constants.isPreviewExamModeLocalStorageKey,
    false
  );
  const { isMobileBreakpoint } = useResponsive();
  const [courseHelpTextSelectedTab, setCourseHelpTextSelectedTab] =
    React.useState<CourseHelpTextEditorTab>(CourseHelpTextEditorTab.WRITE);

  const {
    courseName,
    courseShortName,
    viewable,
    enableGame,
    enableAchievements,
    enableSourcecast,
    enableStories,
    enableExamMode,
    resumeCode,
    moduleHelpText,
    isOfficialCourse
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

  const previewPanel = (
    <div className="input-markdown">
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

  const previewExamModeHandler = () => {
    if (isPreviewExamMode) {
      showWarningMessage(
        <div>
          <span>Exam mode preview has been disabled.&nbsp;</span>
          <Button text={'Refresh Now'} onClick={() => window.location.reload()} />
        </div>,
        10000
      );
    } else {
      showSuccessMessage(
        <div>
          <span>Exam mode preview has been enabled.&nbsp;</span>
          <Button text={'Refresh Now'} onClick={() => window.location.reload()} />
        </div>,
        10000
      );
    }
    setIsPreviewExamMode(i => !i);
  };

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
          {isOfficialCourse && (
            <Switch
              checked={enableExamMode}
              label="Enable Exam Mode"
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  enableExamMode: (e.target as HTMLInputElement).checked
                })
              }
            />
          )}
          {isOfficialCourse && (
            <FormGroup
              // helperText="Please enter the course resume code. Students who attempt to use the DevTool will be asked this code to continue their session."
              inline={true}
              label="Course Resume Code"
              labelFor="courseResumeCode"
            >
              <InputGroup
                id="courseResumeCode"
                defaultValue={resumeCode}
                onChange={e =>
                  props.setCourseConfiguration({
                    ...props.courseConfiguration,
                    resumeCode: (e.target as HTMLInputElement).value
                  })
                }
              />
            </FormGroup>
          )}
          {isOfficialCourse && <Button
            active={isPreviewExamMode}
            text={'Preview Exam Mode'}
            onClick={previewExamModeHandler}
          />}
        </div>
      </div>
    </div>
  );
};

export default CourseConfigPanel;
