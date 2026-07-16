import { HTMLSelect, Popover, Position } from '@blueprintjs/core';
import { useCallback } from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import type { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';

const roleOptions = [
  { label: 'Student', value: Role.Student },
  { label: 'Staff', value: Role.Staff },
  { label: 'Admin', value: Role.Admin },
];

type Props = {
  data: AdminPanelCourseRegistration;
  rowIndex: number;
  courseRegId: number;
  handleUpdateUserRole: (courseRegId: number, role: Role) => void;
};

function RolesCell(props: Props) {
  const { data } = props;

  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.handleUpdateUserRole(data.courseRegId, e.target.value as Role);
    },
    [data, props],
  );
  return (
    <Popover
      content="You cannot downgrade yourself from an admin role!"
      interactionKind="hover-target"
      position={Position.TOP}
      disabled={props.courseRegId !== data.courseRegId}
    >
      <HTMLSelect
        options={roleOptions}
        onChange={changeHandler}
        fill
        minimal
        style={{ verticalAlign: 'top' }}
        value={data.role}
        disabled={props.courseRegId === data.courseRegId}
      />
    </Popover>
  );
}

export default RolesCell;
