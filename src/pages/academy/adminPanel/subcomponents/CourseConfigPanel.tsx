import { Divider, FormGroup, H2, H3, InputGroup, Switch, TextArea } from '@blueprintjs/core';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';
import Constants from 'src/commons/utils/Constants';

import { UpdateCourseConfiguration } from '../../../../commons/application/types/SessionTypes';

export type CourseConfigPanelProps = OwnProps;

type OwnProps = {
  courseConfiguration: UpdateCourseConfiguration;
  setCourseConfiguration: (courseConfiguration: UpdateCourseConfiguration) => void;
};

const CourseConfigPanel: React.FC<CourseConfigPanelProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
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
              'Please enter the module help text that will be used in the course help dialog.'
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
