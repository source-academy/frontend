import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-grid.css';

import { Button, Divider, H1, Intent, Tab, Tabs } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';

import {
  AdminPanelCourseRegistration,
  UpdateCourseConfiguration
} from '../../../commons/application/types/SessionTypes';
import { AssessmentConfiguration } from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AddUserPanel, { UsernameRoleGroup } from './subcomponents/AddUserPanel';
import AssessmentConfigPanel from './subcomponents/assessmentConfigPanel/AssessmentConfigPanel';
import CourseConfigPanel from './subcomponents/CourseConfigPanel';
import UserConfigPanel from './subcomponents/userConfigPanel/UserConfigPanel';

export type AdminPanelProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchCourseConfiguration: () => void;
  handleFetchAssessmentConfigs: () => void;
  handleFetchUserCourseRegistrations: () => void;
  handleUpdateCourseConfig: (courseConfiguration: UpdateCourseConfiguration) => void;
  handleUpdateAssessmentConfigs: (assessmentConfigs: AssessmentConfiguration[]) => void;
  setAssessmentConfigurations: (assessmentConfigs: AssessmentConfiguration[]) => void;
  handleDeleteAssessmentConfig: (assessmentConfig: AssessmentConfiguration) => void;
  handleUpdateUserRole: (courseRegId: number, role: Role) => void;
  handleDeleteUserFromCourse: (courseRegId: number) => void;
  handleAddNewUsersToCourse: (users: UsernameRoleGroup[], provider: string) => void;
};

export type StateProps = {
  courseRegId?: number;
  courseName?: string;
  courseShortName?: string;
  viewable?: boolean;
  enableGame?: boolean;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  // sourceChapter: number;
  // sourceVariant: Variant;
  moduleHelpText?: string;
  assessmentConfigurations?: AssessmentConfiguration[];
  userCourseRegistrations?: AdminPanelCourseRegistration[];
};

const AdminPanel: React.FC<AdminPanelProps> = props => {
  const [hasChangesCourseConfig, setHasChangesCourseConfig] = React.useState(false);
  const [hasChangesAssessmentConfig, setHasChangesAssessmentConfig] = React.useState(false);

  const [courseConfiguration, setCourseConfiguration] = React.useState<UpdateCourseConfiguration>({
    courseName: '',
    courseShortName: '',
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableSourcecast: true,
    moduleHelpText: ''
  });

  /**
   * Mutable ref to track the assessment configuration form state instead of useState. This is
   * because ag-grid does not update the cellRendererParams whenever there is an update in rowData,
   * leading to a stale closure problem where the handlers in AssessmentConfigPanel capture the old
   * value of assessmentConfig.
   *
   * Also, useState causes a flicker in ag-grid during rerenders. Thus we use this mutable ref and
   * ag-grid's API to update cell values instead.
   */
  const assessmentConfig = React.useRef(props.assessmentConfigurations);

  // Tracks the assessment configurations to be deleted in the backend when the save button is clicked
  const [assessmentConfigsToDelete, setAssessmentConfigsToDelete] = React.useState<
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
    setCourseConfiguration({
      courseName: props.courseName,
      courseShortName: props.courseShortName,
      viewable: props.viewable,
      enableGame: props.enableGame,
      enableAchievements: props.enableAchievements,
      enableSourcecast: props.enableSourcecast,
      moduleHelpText: props.moduleHelpText
    });

    // IMPT: To prevent mutation of props
    assessmentConfig.current = cloneDeep(props.assessmentConfigurations);
  }, [props]);

  const courseConfigPanelProps = {
    courseConfiguration: courseConfiguration,
    setCourseConfiguration: (courseConfig: UpdateCourseConfiguration) => {
      setCourseConfiguration(courseConfig);
      setHasChangesCourseConfig(true);
    }
  };

  const assessmentConfigPanelProps = React.useMemo(() => {
    return {
      // Would have been loaded by the useEffect above
      assessmentConfig: assessmentConfig as React.MutableRefObject<AssessmentConfiguration[]>,
      setAssessmentConfig: (val: AssessmentConfiguration[]) => {
        assessmentConfig.current = val;
        setHasChangesAssessmentConfig(true);
      },
      setAssessmentConfigsToDelete: (deletedElement: AssessmentConfiguration) => {
        // If it is not a newly created row that is yet to be persisted in the backend
        if (deletedElement.assessmentConfigId !== -1) {
          const temp = [...assessmentConfigsToDelete];
          temp.push(deletedElement);
          setAssessmentConfigsToDelete(temp);
        }
      },
      setHasChangesAssessmentConfig: setHasChangesAssessmentConfig
    };
  }, [assessmentConfigsToDelete]);

  const userConfigPanelProps = {
    courseRegId: props.courseRegId,
    userCourseRegistrations: props.userCourseRegistrations,
    handleUpdateUserRole: props.handleUpdateUserRole,
    handleDeleteUserFromCourse: props.handleDeleteUserFromCourse
  };

  const addUserPanelProps = {
    handleAddNewUsersToCourse: props.handleAddNewUsersToCourse
  };

  // Handler to submit changes to Course Configration and Assessment Configuration to the backend.
  // Changes made to users are handled separately.
  const submitHandler = () => {
    if (hasChangesCourseConfig) {
      props.handleUpdateCourseConfig(courseConfiguration);
      setHasChangesCourseConfig(false);
    }
    if (assessmentConfigsToDelete.length > 0) {
      assessmentConfigsToDelete.forEach(assessmentConfig => {
        props.handleDeleteAssessmentConfig(assessmentConfig);
      });
      setAssessmentConfigsToDelete([]);
    }
    if (hasChangesAssessmentConfig) {
      // Reset the store first so that old props do not propagate down and cause a flicker
      props.setAssessmentConfigurations([]);

      // assessmentConfig.current will exist after the first load
      props.handleUpdateAssessmentConfigs(assessmentConfig.current!);
      setHasChangesAssessmentConfig(false);
    }
  };

  const data = (
    <div className="admin-panel">
      <H1>Admin Panel</H1>
      {/* renderActiveTabPanelOnly to handle large courses with many entries in ag-grid */}
      <Tabs id="admin-panel" renderActiveTabPanelOnly>
        <Tab
          id="configuration"
          title="Configuration"
          panel={
            <>
              <CourseConfigPanel {...courseConfigPanelProps} />
              <Divider />
              <AssessmentConfigPanel {...assessmentConfigPanelProps} />
              <Button
                text="Save"
                intent={
                  hasChangesCourseConfig || hasChangesAssessmentConfig
                    ? Intent.WARNING
                    : Intent.NONE
                }
                onClick={submitHandler}
              />
            </>
          }
        />
        <Tab id="users" title="Users" panel={<UserConfigPanel {...userConfigPanelProps} />} />
        <Tab id="add-users" title="Add Users" panel={<AddUserPanel {...addUserPanelProps} />} />
      </Tabs>
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default AdminPanel;
