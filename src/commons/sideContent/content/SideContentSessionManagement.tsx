import { Classes, HTMLTable, Switch } from '@blueprintjs/core';
import { CollabEditingAccess, SharedbAceUser } from '@sourceacademy/sharedb-ace/distribution/types';
import React, { useState } from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';

interface AdminViewProps {
  users: Record<string, SharedbAceUser>;
}

function AdminView({ users }: AdminViewProps) {
  const [toggling, setToggling] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(Object.entries(users).map(([id]) => [id, true]))
  );
  const updateUserRoleCallback = useTypedSelector(
    store => store.workspaces.playground.updateUserRoleCallback
  );

  const handleToggleAccess = (checked: boolean, id: string) => {
    if (toggling[id]) return;

    setToggling(prev => ({ ...prev, [id]: true }));

    try {
      updateUserRoleCallback(id, checked ? CollabEditingAccess.EDITOR : CollabEditingAccess.VIEWER);
    } finally {
      setToggling(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <HTMLTable compact>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(users).map(([userId, user], index) => (
          <tr key={userId}>
            <td className={Classes.INTERACTIVE}>
              <div style={{ backgroundColor: index === 0 ? '#ced9e0' : user.color }} />
              <div>{user.name}</div>
            </td>
            <td>
              <Switch
                labelElement={
                  user.role === CollabEditingAccess.OWNER
                    ? 'Admin'
                    : user.role.charAt(0).toUpperCase() + user.role.slice(1)
                }
                alignIndicator="right"
                checked={
                  user.role === CollabEditingAccess.OWNER ||
                  user.role === CollabEditingAccess.EDITOR
                }
                disabled={user.role === CollabEditingAccess.OWNER}
                onChange={event => handleToggleAccess(event.target.checked, userId)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  );
}

type Props = {
  users: Record<string, SharedbAceUser>;
};

const SideContentSessionManagement: React.FC<Props> = ({ users }) => {
  if (Object.values(users).length === 0) return;
  const myself = Object.values(users)[0];

  return (
    <div className="session-management-table">
      {myself.role === CollabEditingAccess.OWNER ? (
        <AdminView users={users} />
      ) : (
        <HTMLTable compact>
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(users).map((user, index) => {
              return (
                <tr key={user.color}>
                  <td className={Classes.INTERACTIVE}>
                    <div style={{ backgroundColor: index === 0 ? '#ced9e0' : user.color }} />
                    <div>{user.name}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </HTMLTable>
      )}
    </div>
  );
};

export default SideContentSessionManagement;
