import { HTMLSelect, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';

type RolesCellProps = OwnProps;

type OwnProps = {
  data: AdminPanelCourseRegistration;
  rowIndex: number;
  crId: number;
  handleUpdateUserRole: (crId: number, role: Role) => void;
};

const RolesCell: React.FC<RolesCellProps> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.handleUpdateUserRole(data.crId, e.target.value as Role);
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
    <Popover2
      content="You cannot downgrade yourself from an admin role!"
      interactionKind="hover-target"
      position={Position.TOP}
      disabled={props.crId !== data.crId}
    >
      <HTMLSelect
        options={roleOptions}
        onChange={changeHandler}
        fill
        minimal
        style={{ textAlign: 'center' }}
        value={data.role}
        disabled={props.crId === data.crId}
      />
    </Popover2>
  );
};

export default RolesCell;
