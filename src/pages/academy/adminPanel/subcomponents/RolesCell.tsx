import { HTMLSelect } from '@blueprintjs/core';
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
    <HTMLSelect
      options={roleOptions}
      onChange={changeHandler}
      fill
      minimal
      style={{ textAlign: 'center' }}
      value={data.role}
      disabled={props.crId === data.crId}
    />
  );
};

export default RolesCell;
