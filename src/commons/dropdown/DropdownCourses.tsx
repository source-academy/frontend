import { Classes, Dialog, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { Role } from '../application/ApplicationTypes';
import { UserCourse } from '../application/types/SessionTypes';
import { history } from '../utils/HistoryHelper';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  courses: UserCourse[];
  courseId?: number;
};

const DropdownCourses: React.FC<DialogProps> = props => {
  const { courses } = props;

  const options = courses.map(course => ({
    value: course.courseId,
    label: course.courseName.concat(!course.viewable ? ' - disabled' : ''),
    disabled: !course.viewable && course.role !== Role.Admin
  }));

  const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    history.push(`/courses/${e.currentTarget.value}`);
    props.onClose();
  };

  return (
    <Dialog
      className="my-courses"
      icon={IconNames.PROPERTIES}
      isCloseButtonShown={true}
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="My Courses"
    >
      <div className={Classes.DIALOG_BODY}>
        <div>Select a course to switch to:</div>
        <HTMLSelect
          value={props.courseId}
          options={options}
          fill
          onChange={onChangeHandler}
          disabled={courses.length <= 1}
        />
      </div>
    </Dialog>
  );
};

export default DropdownCourses;
