import { HTMLSelect, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';

type RolesCellProps = OwnProps;

type OwnProps = {
  data: AdminPanelCourseRegistration;
  rowIndex: number;
  courseRegId: number;
  handleUpdateUserStoriesRole: (courseRegId: number, storiesRole: StoriesRole) => void;
};

const RolesCell: React.FC<RolesCellProps> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.handleUpdateUserStoriesRole(data.courseRegId, e.target.value as StoriesRole);
    },
    [data, props]
  );

  const roleOptions = [
    {
      label: 'User',
      value: StoriesRole.Standard
    },
    {
      label: 'Moderator',
      value: StoriesRole.Moderator
    },
    {
      label: 'Admin',
      value: StoriesRole.Admin
    }
  ];
  return (
    <Popover2
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
    </Popover2>
  );
};

export default RolesCell;
