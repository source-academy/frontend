import {
  Button,
  Dialog,
  DialogBody,
  FormGroup,
  H6,
  HTMLSelect,
  InputGroup,
  Switch,
  Tab,
  Tabs,
  Text,
  TextArea
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';
import { useDispatch } from 'react-redux';
import AcademyActions from 'src/features/academy/AcademyActions';

import { CourseHelpTextEditorTab } from '../../pages/academy/adminPanel/subcomponents/CourseConfigPanel';
import { sourceLanguages } from '../application/ApplicationTypes';
import { UpdateCourseConfiguration } from '../application/types/SessionTypes';
import Markdown from '../Markdown';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DropdownCreateCourse: React.FC<Props> = props => {
  const dispatch = useDispatch();

  const [courseConfig, setCourseConfig] = React.useState<UpdateCourseConfiguration>({
    courseName: '',
    courseShortName: '',
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableSourcecast: true,
    enableStories: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: ''
  });

  const [courseHelpTextSelectedTab, setCourseHelpTextSelectedTab] =
    React.useState<CourseHelpTextEditorTab>(CourseHelpTextEditorTab.WRITE);

  const sourceChapterOptions = [
    { value: Chapter.SOURCE_1 },
    { value: Chapter.SOURCE_2 },
    { value: Chapter.SOURCE_3 },
    { value: Chapter.SOURCE_4 }
  ];

  const sourceVariantOptions = (chapter: Chapter) =>
    sourceLanguages
      .filter(e => e.chapter === chapter)
      .map(e => {
        return {
          label: e.variant.replace(/^\w/, c => c.toUpperCase()),
          value: e.variant
        };
      });

  const submitHandler = () => {
    // Validate that courseName is not an empty string
    if (courseConfig.courseName === '') {
      showWarningMessage('Course Name cannot be empty!');
      return;
    }
    dispatch(AcademyActions.createCourse(courseConfig));
    props.onClose();
  };

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
    <Dialog
      className="create-course"
      icon={IconNames.ADD}
      isCloseButtonShown={true}
      canOutsideClickClose={false}
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Create Course"
    >
      <DialogBody>
        <H6>Create your own Source Academy course and manage your own learners!</H6>
        <br />
        <FormGroup
          helperText="Please enter the course name that will be used for course selection"
          label="Course Name"
          labelInfo="(* required)"
          labelFor="courseName"
        >
          <InputGroup
            id="courseName"
            value={courseConfig.courseName}
            onChange={e =>
              setCourseConfig({
                ...courseConfig,
                courseName: e.target.value
              })
            }
          />
        </FormGroup>
        <FormGroup
          helperText="Usually the module code of the course. This will be displayed on the top left."
          label={'Course Short Name'}
          labelInfo="(optional)"
          labelFor="courseShortName"
        >
          <InputGroup
            id="courseShortName"
            value={courseConfig.courseShortName}
            onChange={e =>
              setCourseConfig({
                ...courseConfig,
                courseShortName: e.target.value
              })
            }
          />
        </FormGroup>
        <FormGroup
          helperText="The module help text will be used in the course help dialog."
          labelFor="moduleHelpText"
        >
          <Text tagName="span">Module Help Text&nbsp;</Text>
          <Text tagName="span" className="optional-text">
            (optional)
          </Text>
          <Tabs
            selectedTabId={courseHelpTextSelectedTab}
            onChange={onChangeTabs}
            className="module-help-text-tabs"
          >
            <Tab id={CourseHelpTextEditorTab.WRITE} title="Write" />
            <Tab id={CourseHelpTextEditorTab.PREVIEW} title="Preview" />
          </Tabs>
          {courseHelpTextSelectedTab === CourseHelpTextEditorTab.WRITE && (
            <TextArea
              id="moduleHelpText"
              className="input-textarea"
              fill={true}
              value={courseConfig.moduleHelpText}
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  moduleHelpText: e.target.value
                })
              }
            />
          )}
          {courseHelpTextSelectedTab === CourseHelpTextEditorTab.PREVIEW && (
            <div className="input-markdown">
              <Markdown content={courseConfig.moduleHelpText || ''} openLinksInNewWindow />
            </div>
          )}
        </FormGroup>

        <div className="boolean-container">
          <div>
            <Switch
              checked={courseConfig.viewable}
              inline
              label="Viewable"
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  viewable: (e.target as HTMLInputElement).checked
                })
              }
            />
            <Switch
              checked={courseConfig.enableAchievements}
              inline
              label="Enable Achievements"
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  enableAchievements: (e.target as HTMLInputElement).checked
                })
              }
            />
          </div>
          <div>
            <Switch
              checked={courseConfig.enableGame}
              inline
              label="Enable Game"
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  enableGame: (e.target as HTMLInputElement).checked
                })
              }
            />

            <Switch
              checked={courseConfig.enableSourcecast}
              inline
              label="Enable Sourcecast"
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  enableSourcecast: (e.target as HTMLInputElement).checked
                })
              }
            />

            <Switch
              checked={courseConfig.enableStories}
              inline
              label="Enable Stories"
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  enableStories: (e.target as HTMLInputElement).checked
                })
              }
            />
          </div>
        </div>
        <div>
          <FormGroup
            label="Default Source Chapter"
            labelInfo="(configurable later on)"
            labelFor="source-chapter"
          >
            <HTMLSelect
              id="source-chapter"
              options={sourceChapterOptions}
              value={courseConfig.sourceChapter}
              onChange={e => {
                setCourseConfig({
                  ...courseConfig,
                  sourceChapter: parseInt(e.target.value)
                });
              }}
              fill
            />
          </FormGroup>
          <FormGroup
            label="Default Source Variant"
            labelInfo="(configurable later on)"
            labelFor="source-variant"
          >
            <HTMLSelect
              id="source-variant"
              options={sourceVariantOptions(courseConfig.sourceChapter!)}
              value={courseConfig.sourceVariant}
              onChange={e => {
                setCourseConfig({
                  ...courseConfig,
                  sourceVariant: e.target.value as Variant
                });
              }}
              fill
            />
          </FormGroup>
        </div>
        <div className="create-course-button-container">
          <Button text="Create Course" onClick={submitHandler} />
        </div>
      </DialogBody>
    </Dialog>
  );
};

export default DropdownCreateCourse;
