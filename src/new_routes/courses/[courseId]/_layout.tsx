import { Card, Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import ResearchAgreementPrompt from 'src/commons/researchAgreementPrompt/ResearchAgreementPrompt';
import Constants from 'src/commons/utils/Constants';
import { useAppDispatch, useAppSelector, useSession } from 'src/commons/utils/Hooks';
import classes from 'src/pages/academy/Academy.module.scss';

import SessionActions from '../../../commons/application/actions/SessionActions';
import { numberRegExp } from '../../../features/academy/AcademyTypes';
import RagChatbot from '../../../pages/academy/ragChatbot/RagChatbot';

function Academy() {
  const dispatch = useAppDispatch();
  useEffect(() => {
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
      <RagChatbot />
    </div>
  );
}

function CourseSelectingAcademy() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { courseId, enableExamMode, role } = useAppSelector(state => state.session);
  const applyEnableExamMode = enableExamMode && role === Role.Student;
  const { courseId: routeCourseIdStr } = useParams<{ courseId?: string }>();
  const routeCourseId = routeCourseIdStr != null ? parseInt(routeCourseIdStr, 10) : undefined;

  useEffect(() => {
    // Regex to handle case where routeCourseIdStr is not a number
    if (!routeCourseIdStr?.match(numberRegExp)) {
      navigate('/');
      return;
    }

    if (routeCourseId !== undefined && !Number.isNaN(routeCourseId) && courseId !== routeCourseId) {
      dispatch(SessionActions.updateLatestViewedCourse(routeCourseId));
    }

    if (applyEnableExamMode) {
      navigate(`/courses/${courseId}`);
    }
  }, [courseId, dispatch, routeCourseId, navigate, routeCourseIdStr, applyEnableExamMode]);

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
}

export const Component = CourseSelectingAcademy;
