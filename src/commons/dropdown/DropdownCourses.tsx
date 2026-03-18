import { Dialog, DialogBody, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { Role } from '../application/ApplicationTypes';
import { UserCourse } from '../application/types/SessionTypes';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  courses: UserCourse[];
  courseId?: number;
};

const DropdownCourses: React.FC<Props> = ({ isOpen, onClose, courses, courseId }) => {
  const navigate = useNavigate();

  const options = courses.map(course => ({
    value: course.courseId,
    label: course.courseName.concat(!course.viewable ? ' - disabled' : ''),
    disabled: !course.viewable && course.role !== Role.Admin
  }));

  const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/courses/${e.currentTarget.value}`);
    onClose();
  };

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
