import { HTMLSelect, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { AdminPanelStoriesUsers } from 'src/features/stories/StoriesTypes';

type RolesCellProps = OwnProps;

type OwnProps = {
  data: AdminPanelStoriesUsers;
  rowIndex: number;
  id: number;
  handleUpdateUserRole: (id: number, role: StoriesRole) => void;
};

const RolesCell: React.FC<RolesCellProps> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.handleUpdateUserRole(data.id, e.target.value as StoriesRole);
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
      disabled={props.id !== data.id}
    >
      <HTMLSelect
        options={roleOptions}
        onChange={changeHandler}
        fill
        minimal
        style={{ textAlign: 'center' }}
        // value={data.role}
        value = {'to be added'}
        disabled={props.id === data.id}
      />
    </Popover2>
  );
};

export default RolesCell;
