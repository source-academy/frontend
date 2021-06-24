import {
  // Alert,
  // Button,
  Divider,
  FormGroup,
  H2,
  H3,
  InputGroup,
  // Intent,
  Switch,
  TextArea
} from '@blueprintjs/core';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';
import Constants from 'src/commons/utils/Constants';

import { UpdateCourseConfiguration } from '../../../../commons/application/types/SessionTypes';
// import { showSuccessMessage } from '../../../../commons/utils/NotificationsHelper';

export type CourseConfigPanelProps = OwnProps;

type OwnProps = {
  courseConfiguration: UpdateCourseConfiguration;
  setCourseConfiguration: (courseConfiguration: UpdateCourseConfiguration) => void;
};

// export type DispatchProps = {
//   // handleUpdateCourseConfig: (courseConfiguration: UpdateCourseConfiguration) => void;
// };

// export type StateProps = {
// };

const CourseConfigPanel: React.FC<CourseConfigPanelProps> = props => {
  // const [courseConfig, setCourseConfig] = React.useState<UpdateCourseConfiguration>({});

  // const [courseName, setCourseName] = React.useState(props.courseName);
  // const [courseShortName, setCourseShortName] = React.useState(props.courseShortName);
  // const [viewable, setViewable] = React.useState(props.viewable);
  // const [enableGame, setEnableGame] = React.useState(props.enableGame);
  // const [enableAchievements, setEnableAchievements] = React.useState(props.enableAchievements);
  // const [enableSourcecast, setEnableSourcecast] = React.useState(props.enableSourcecast);
  // const [moduleHelpText, setModuleHelpText] = React.useState(props.moduleHelpText);

  // const [alertOpen, setAlertOpen] = React.useState(false);
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  // const handleOpenAlert = () => {
  //   saveChanges();
  //   setAlertOpen(true);
  // };
  // const handleCloseAlert = () => setAlertOpen(false);

  // const saveChanges = () => {
  //   setCourseConfig({
  //     ...courseConfig,
  //     courseName: courseName,
  //     courseShortName: courseShortName,
  //     viewable: viewable,
  //     enableGame: enableGame,
  //     enableAchievements: enableAchievements,
  //     enableSourcecast: enableSourcecast,
  //     moduleHelpText: moduleHelpText
  //   });

  //   showSuccessMessage('changes saved on this page', 1000);
  // };

  // const updateCourseConfig = () => {
  //   props.handleUpdateCourseConfig(courseConfig);
  //   handleCloseAlert();
  // };

  // const handleBooleanChange = (handler: (checked: boolean) => void) => {
  //   return (event: React.FormEvent<HTMLElement>) =>
  //     handler((event.target as HTMLInputElement).checked);
  // };

  // const handleStringChange = (handler: (value: string) => void) => {
  //   return (event: React.FormEvent<HTMLElement>) =>
  //     handler((event.target as HTMLInputElement).value);
  // };

  const {
    courseName,
    courseShortName,
    viewable,
    enableGame,
    enableAchievements,
    enableSourcecast,
    moduleHelpText
  } = props.courseConfiguration;

  return (
    <div className="course-configuration">
      <H2>{courseName}</H2>
      <H3>{courseShortName}</H3>
      <div className="inputs">
        <div className="text">
          <FormGroup
            helperText={'Please enter the course name that will be used for course selection'}
            inline={true}
            label={'Course Name'}
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
            helperText={
              'Usually the module code of the course. This will be displayed on the top left.'
            }
            inline={true}
            label={'Course Short Name'}
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
            helperText={
              'Please enter the module help text that will be used in this and this place.'
            }
            inline={true}
            label={'Module Help Text'}
            labelFor="moduleHelpText"
          >
            <TextArea
              id="moduleHelpText"
              fill={true}
              defaultValue={moduleHelpText}
              onChange={e =>
                props.setCourseConfiguration({
                  ...props.courseConfiguration,
                  moduleHelpText: e.target.value
                })
              }
            />
          </FormGroup>
        </div>
        {/* <div className="divider" /> */}
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
      {/* <Button onClick={saveChanges}>Save</Button> */}
      {/* <div>
        <Button onClick={handleOpenAlert}>Submit</Button>
      </div> */}
      {/* <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Confirm"
        icon="warning-sign"
        intent={Intent.WARNING}
        isOpen={alertOpen}
        onCancel={handleCloseAlert}
        onConfirm={updateCourseConfig}
      >
        <p>Are you sure you want to save the Course Configuration to the backend?</p>
      </Alert> */}
    </div>
  );
};

export default CourseConfigPanel;
