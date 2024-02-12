import { HTMLSelect, Popover, Position } from '@blueprintjs/core';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';

type RolesCellProps = OwnProps;

type OwnProps = {
  data: AdminPanelCourseRegistration;
  rowIndex: number;
  courseRegId: number;
  handleUpdateUserRole: (courseRegId: number, role: Role) => void;
};

const RolesCell: React.FC<RolesCellProps> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.handleUpdateUserRole(data.courseRegId, e.target.value as Role);
    },
    [data, props]
  );

  const roleOptions = [
    {
      label: 'Student',
      value: Role.Student
    },
    {
      label: 'Staff',
      value: Role.Staff
    },
    {
      label: 'Admin',
      value: Role.Admin
    }
  ];
  return (
    <Popover
      content="You cannot downgrade yourself from an admin role!"
      interactionKind="click"
      position={Position.TOP}
      disabled={props.courseRegId !== data.courseRegId}
    >
      <HTMLSelect
        options={roleOptions}
        onChange={changeHandler}
        fill
        minimal
        style={{ textAlign: 'center' }}
        value={data.role}
        disabled={props.courseRegId === data.courseRegId}
      />
    </Popover>
  );
};

export default RolesCell;
