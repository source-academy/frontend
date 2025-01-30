import { Dialog, DialogBody, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import SessionActions from '../application/actions/SessionActions';
import { Role } from '../application/ApplicationTypes';
import { UserCourse } from '../application/types/SessionTypes';
import { useTypedSelector } from '../utils/Hooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  courses: UserCourse[];
  courseId?: number;
};

const DropdownCourses: React.FC<Props> = ({ isOpen, onClose, courses, courseId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const latestCourse = useTypedSelector(state => state.session.courseId);

  const options = courses.map(course => ({
    value: course.courseId,
    label: course.courseName.concat(!course.viewable ? ' - disabled' : ''),
    disabled: !course.viewable && course.role !== Role.Admin
  }));

  const onChangeHandler = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await dispatch(SessionActions.updateLatestViewedCourse(Number(e.currentTarget.value)));
    onClose();
  };

  useEffect(() => {
    if (latestCourse) {
      navigate(`/courses/${latestCourse}`);
    }
  }, [latestCourse, navigate]);

  return (
    <Dialog
      icon={IconNames.PROPERTIES}
      isCloseButtonShown={true}
      isOpen={isOpen}
      onClose={onClose}
      title="My Courses"
    >
      <DialogBody>
        <p>Select a course to switch to:</p>
        <HTMLSelect
          value={courseId}
          options={options}
          fill
          onChange={onChangeHandler}
          disabled={courses.length <= 1}
        />
      </DialogBody>
    </Dialog>
  );
};

export default DropdownCourses;
