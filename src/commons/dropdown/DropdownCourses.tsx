import { Dialog, DialogBody, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useNavigate } from 'react-router';
import { useLocalStorageState } from 'src/commons/hooks/useLocalStorageState';

import { Role } from '../application/ApplicationTypes';
import type { UserCourse } from '../application/types/SessionTypes';
import Constants from '../utils/Constants';
import { useSession } from '../utils/Hooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  courses: UserCourse[];
  courseId?: number;
};

function DropdownCourses({ isOpen, onClose, courses, courseId }: Props) {
  const navigate = useNavigate();
  const { enableExamMode, role } = useSession();
  const [isPreviewExamMode] = useLocalStorageState(
    Constants.isPreviewExamModeLocalStorageKey,
    false,
  );

  const options = courses.map(course => ({
    value: course.courseId,
    label: course.courseName.concat(!course.viewable ? ' - disabled' : ''),
    disabled: !course.viewable && course.role !== Role.Admin,
  }));

  const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/courses/${e.currentTarget.value}`);
    onClose();
  };

  return (
    <Dialog
      icon={IconNames.PROPERTIES}
      isCloseButtonShown
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
          disabled={
            courses.length <= 1 || isPreviewExamMode || (enableExamMode && role === Role.Student)
          }
        />
      </DialogBody>
    </Dialog>
  );
}

export default DropdownCourses;
