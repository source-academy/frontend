import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-grid.css';

import { Divider, H1, NonIdealState, Spinner, SpinnerSize, Tab, Tabs } from '@blueprintjs/core';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';

import {
  AdminPanelCourseRegistration,
  UpdateCourseConfiguration
} from '../../../commons/application/types/SessionTypes';
import {
  AssessmentConfiguration,
  AssessmentType
} from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AssessmentConfigPanel from './subcomponents/AssessmentConfigPanel';
import CourseConfigPanel from './subcomponents/CourseConfigPanel';
import UserConfigPanel from './subcomponents/UserConfigPanel';

export type AdminPanelProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchCourseConfiguration: () => void;
  handleFetchAssessmentConfigs: () => void;
  handleFetchUserCourseRegistrations: () => void;
  handleUpdateCourseConfig: (courseConfiguration: UpdateCourseConfiguration) => void;
  handleUpdateAssessmentConfigs: (assessmentConfigs: AssessmentConfiguration[]) => void;
  handleUpdateUserRole: (crId: number, role: Role) => void;
  handleDeleteUserFromCourse: (crId: number) => void;
};

export type StateProps = {
  crId?: number;
  courseName?: string;
  courseShortName?: string;
  viewable?: boolean;
  enableGame?: boolean;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  // sourceChapter: number;
  // sourceVariant: Variant;
  moduleHelpText?: string;
  assessmentTypes: AssessmentType[];
  assessmentConfigurations?: AssessmentConfiguration[];
  userCourseRegistrations?: AdminPanelCourseRegistration[];
};

const AdminPanel: React.FC<AdminPanelProps> = props => {
  // Boolean to track the loading status of CourseConfiguration and AssessmentConfiguration
  const [isLoaded, setIsLoaded] = React.useState(false);

  const [courseConfiguration, setCourseConfiguration] = React.useState<UpdateCourseConfiguration>(
    {}
  );
  const [assessmentConfigurations, setAssessmentConfigurations] = React.useState<
    AssessmentConfiguration[]
  >([]);

  React.useEffect(() => {
    props.handleFetchCourseConfiguration();
    props.handleFetchAssessmentConfigs();
    props.handleFetchUserCourseRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After updated configs have been loaded from the backend, put them into local React state
  React.useEffect(() => {
    if (props.assessmentConfigurations && props.userCourseRegistrations && !isLoaded) {
      setCourseConfiguration({
        courseName: props.courseName,
        courseShortName: props.courseShortName,
        viewable: props.viewable,
        enableGame: props.enableGame,
        enableAchievements: props.enableAchievements,
        enableSourcecast: props.enableSourcecast,
        moduleHelpText: props.moduleHelpText
      });
      setAssessmentConfigurations(props.assessmentConfigurations);
      setIsLoaded(true);
    }
  }, [props, isLoaded]);

  const courseConfigPanelProps = {
    courseConfiguration: courseConfiguration,
    setCourseConfiguration: setCourseConfiguration
  };

  const assessmentConfigPanelProps = {
    assessmentConfigurations: assessmentConfigurations,
    setAssessmentConfigurations: setAssessmentConfigurations
  };

  const userConfigPanelProps = {
    crId: props.crId,
    userCourseRegistrations: props.userCourseRegistrations,
    handleUpdateUserRole: props.handleUpdateUserRole,
    handleDeleteUserFromCourse: props.handleDeleteUserFromCourse
  };

  const data = !isLoaded ? (
    <NonIdealState description="Loading..." icon={<Spinner size={SpinnerSize.LARGE} />} />
  ) : (
    <div className="admin-panel">
      <H1>Admin Panel</H1>
      <Tabs id="admin-panel">
        <Tab
          id="configuration"
          title="Configuration"
          panel={
            <>
              <CourseConfigPanel {...courseConfigPanelProps} />
              <Divider />
              <AssessmentConfigPanel {...assessmentConfigPanelProps} />
            </>
          }
        />
        <Tab id="users" title="Users" panel={<UserConfigPanel {...userConfigPanelProps} />} />
      </Tabs>
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default AdminPanel;
