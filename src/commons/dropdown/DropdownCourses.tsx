import { Classes, Dialog, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { UserCourse } from '../application/types/SessionTypes';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  updateLatestViewedCourse: (courseId: number) => void;
  courses: UserCourse[];
};

const DropdownCourses: React.FC<DialogProps> = props => {
  const { courses, updateLatestViewedCourse } = props;

  const options = courses.map(course => ({
    value: course.courseId,
    label: course.courseName,
    disabled: !course.viewable
  }));

  const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateLatestViewedCourse(parseInt(e.currentTarget.value, 10));
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
