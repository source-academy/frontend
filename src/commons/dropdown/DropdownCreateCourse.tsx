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
  TextArea,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Chapter, Variant } from 'js-slang/dist/langs';
import { useCallback, useState } from 'react';
import { useAppDispatch } from 'src/commons/utils/Hooks';
import AcademyActions from 'src/features/academy/AcademyActions';

import { CourseHelpTextEditorTab } from '../../features/adminPanel/subcomponents/CourseConfigPanel';
import { sourceLanguages } from '../application/ApplicationTypes';
import type { UpdateCourseConfiguration } from '../application/types/SessionTypes';
import Markdown from '../Markdown';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function DropdownCreateCourse(props: Props) {
  const dispatch = useAppDispatch();

  const [courseConfig, setCourseConfig] = useState<UpdateCourseConfiguration>({
    courseName: '',
    courseShortName: '',
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableLlmGrading: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: '',
    llmApiKey: '',
  });

  const [courseHelpTextSelectedTab, setCourseHelpTextSelectedTab] =
    useState<CourseHelpTextEditorTab>(CourseHelpTextEditorTab.WRITE);

  const sourceChapterOptions = [
    { value: Chapter.SOURCE_1 },
    { value: Chapter.SOURCE_2 },
    { value: Chapter.SOURCE_3 },
    { value: Chapter.SOURCE_4 },
  ];

  const sourceVariantOptions = (chapter: Chapter) =>
    sourceLanguages
      .filter(e => e.chapter === chapter)
      .map(e => {
        return {
          label: e.variant.replace(/^\w/, c => c.toUpperCase()),
          value: e.variant,
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
    <Dialog
      icon={IconNames.ADD}
      isCloseButtonShown
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
                courseName: e.target.value,
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
                courseShortName: e.target.value,
              })
            }
          />
        </FormGroup>
        <FormGroup
          helperText="The module help text will be used in the course help dialog."
          labelFor="moduleHelpText"
        >
          <Text tagName="span">Module Help Text&nbsp;</Text>
          <Text tagName="span" className="optional-text text-[#5c7080]">
            (optional)
          </Text>
          <Tabs
            selectedTabId={courseHelpTextSelectedTab}
            onChange={onChangeTabs}
            className="module-help-text-tabs inline-block ml-3.75"
          >
            <Tab id={CourseHelpTextEditorTab.WRITE} title="Write" />
            <Tab id={CourseHelpTextEditorTab.PREVIEW} title="Preview" />
          </Tabs>
          {courseHelpTextSelectedTab === CourseHelpTextEditorTab.WRITE && (
            <TextArea
              id="moduleHelpText"
              className="h-25"
              fill
              value={courseConfig.moduleHelpText}
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  moduleHelpText: e.target.value,
                })
              }
            />
          )}
          {courseHelpTextSelectedTab === CourseHelpTextEditorTab.PREVIEW && (
            <div className="p-2.5 h-25 bg-[#f5f5f5] rounded overflow-auto [box-shadow:inset_0_0_0_1px_rgba(16,22,26,0.15),inset_0_1px_1px_rgba(16,22,26,0.2)] [&>div>*]:m-0">
              <Markdown content={courseConfig.moduleHelpText || ''} openLinksInNewWindow />
            </div>
          )}
        </FormGroup>

        <div className="boolean-container flex">
          <div>
            <Switch
              checked={courseConfig.viewable}
              inline
              label="Viewable"
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  viewable: (e.target as HTMLInputElement).checked,
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
                  enableAchievements: (e.target as HTMLInputElement).checked,
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
                  enableGame: (e.target as HTMLInputElement).checked,
                })
              }
            />

            <Switch
              checked={courseConfig.enableLlmGrading}
              inline
              label="Enable LLM Grading"
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  enableLlmGrading: (e.target as HTMLInputElement).checked,
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
                  sourceChapter: parseInt(e.target.value),
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
                  sourceVariant: e.target.value as Variant,
                });
              }}
              fill
            />
          </FormGroup>
          <FormGroup
            helperText="API Key for LLM endpoint. This key will be encrypted and will not be retrievable on the frontend after."
            label={'LLM API Key'}
            labelInfo="(optional)"
            labelFor="llmApiKey"
          >
            <InputGroup
              id="llmApiKey"
              type="password"
              value={courseConfig.llmApiKey}
              onChange={e =>
                setCourseConfig({
                  ...courseConfig,
                  llmApiKey: e.target.value,
                })
              }
            />
          </FormGroup>
        </div>
        <div className="create-course-button-container mt-5 flex justify-center items-center">
          <Button text="Create Course" onClick={submitHandler} />
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default DropdownCreateCourse;
