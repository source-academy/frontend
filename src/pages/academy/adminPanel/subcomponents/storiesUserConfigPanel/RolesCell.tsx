import { HTMLSelect, Popover, Position } from '@blueprintjs/core';
import React from 'react';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { AdminPanelStoriesUser } from 'src/features/stories/StoriesTypes';

type Props = {
  data: AdminPanelStoriesUser;
  rowIndex: number;
  id: number;
  handleUpdateStoriesUserRole: (id: number, role: StoriesRole) => void;
};

const RolesCell: React.FC<Props> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.handleUpdateStoriesUserRole(data.id, e.target.value as StoriesRole);
    },
    [data, props]
  );

  const roleOptions = [
    { label: 'User', value: StoriesRole.Standard },
    { label: 'Moderator', value: StoriesRole.Moderator },
    { label: 'Admin', value: StoriesRole.Admin }
  ];
  return (
    <Popover
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
        value={data.role}
        disabled={props.id === data.id}
      />
    </Popover>
  );
};

export default RolesCell;
