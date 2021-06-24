import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-grid.css';

import { Divider, H1, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import * as React from 'react';

import { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import {
  AssessmentConfiguration,
  AssessmentType
} from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AssessmentConfigPanel from './subcomponents/AssessmentConfigPanel';
import CourseConfigPanel from './subcomponents/CourseConfigPanel';

export type AdminPanelProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchCourseConfiguration: () => void;
  handleFetchAssessmentConfigs: () => void;
  handleUpdateCourseConfig: (courseConfiguration: UpdateCourseConfiguration) => void;
  handleUpdateAssessmentConfigs: (assessmentConfigs: AssessmentConfiguration[]) => void;
};

export type StateProps = {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After updated configs have been loaded from the backend, put them into local React state
  React.useEffect(() => {
    // props.assessmentConfigurations is undefined until it is fetched in the useEffect above.
    if (props.assessmentConfigurations && !isLoaded) {
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

  const data = !isLoaded ? (
    <NonIdealState description="Loading..." icon={<Spinner size={SpinnerSize.LARGE} />} />
  ) : (
    <div className="admin-panel">
      <H1>Admin Panel</H1>
      <CourseConfigPanel {...courseConfigPanelProps} />
      <Divider />
      <AssessmentConfigPanel {...assessmentConfigPanelProps} />
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default AdminPanel;
