import { Card, Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router';
import ResearchAgreementPrompt from 'src/commons/researchAgreementPrompt/ResearchAgreementPrompt';
import Constants from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import classes from 'src/styles/Academy.module.scss';

import SessionActions from '../../commons/application/actions/SessionActions';
import { numberRegExp } from '../../features/academy/AcademyTypes';

const Academy: React.FC = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(SessionActions.fetchStudents());
    dispatch(SessionActions.fetchNotifications());
    dispatch(SessionActions.fetchTeamFormationOverviews(false));
  }, [dispatch]);

  const { agreedToResearch } = useSession();

  return (
    <div className={classes['Academy']}>
      {/* agreedToResearch has a default value of undefined in the store.
            It will take on null/true/false when the backend returns. */}
      {Constants.showResearchPrompt && agreedToResearch === null && <ResearchAgreementPrompt />}
      <Outlet />
    </div>
  );
};

const CourseSelectingAcademy: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useSession();
  const { courseId: routeCourseIdStr } = useParams<{ courseId?: string }>();
  const routeCourseId = routeCourseIdStr != null ? parseInt(routeCourseIdStr, 10) : undefined;

  React.useEffect(() => {
    // Regex to handle case where routeCourseIdStr is not a number
    if (!routeCourseIdStr?.match(numberRegExp)) {
      return navigate('/');
    }

    if (routeCourseId !== undefined && !Number.isNaN(routeCourseId) && courseId !== routeCourseId) {
      dispatch(SessionActions.updateLatestViewedCourse(routeCourseId));
    }
  }, [courseId, dispatch, routeCourseId, navigate, routeCourseIdStr]);

  return Number.isNaN(routeCourseId) ? (
    <Navigate to="/" />
  ) : routeCourseId === courseId ? (
    <Academy />
  ) : (
    <div className={classNames(classes['Academy-switching-courses'], Classes.DARK)}>
      <Card className={Classes.ELEVATION_4}>
        <NonIdealState
          description="Switching courses..."
          icon={<Spinner size={SpinnerSize.LARGE} />}
        />
      </Card>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = CourseSelectingAcademy;
Component.displayName = 'Academy';

export default CourseSelectingAcademy;
