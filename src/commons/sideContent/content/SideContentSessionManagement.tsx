import { Classes, HTMLTable, Icon, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { CollabEditingAccess, type SharedbAceUser } from '@sourceacademy/sharedb-ace/types';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { changeDefaultEditable } from 'src/commons/collabEditing/CollabEditingHelper';
//import { changeDefaultEditable } from 'src/commons/collabEditing/CollabEditingHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { showSuccessMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import classes from 'src/styles/SideContentSessionManagement.module.scss';

interface AdminViewProps {
  users: Record<string, SharedbAceUser>;
  playgroundCode: string;
  defaultReadOnly: boolean;
}

function AdminView({ users, playgroundCode }: AdminViewProps) {
  const [toggleAll, setToggleAll] = useState<boolean>(true);
  const [defaultRole, setDefaultRole] = useState<boolean>(true);
  const [toggling, setToggling] = useState<{ [key: string]: boolean }>(() => ({
    ...Object.fromEntries(Object.entries(users).map(([id]) => [id, true]))
  }));
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

  const handleAllToggleAccess = (checked: boolean) => {
    try {
      Object.keys(users).forEach(userId => {
        if (userId !== 'all') {
          updateUserRoleCallback(
            userId,
            checked ? CollabEditingAccess.EDITOR : CollabEditingAccess.VIEWER
          );
        }
      });
    } finally {
      setToggleAll(checked);
    }
  };

  const handleDefaultToggleAccess = (checked: boolean) => {
    changeDefaultEditable(playgroundCode, !checked);
    setDefaultRole(checked);
    return;
  };

  return (
    <>
      <span className={classes['span']}>
        Toggle all roles in current session:
        <Switch
          labelElement={toggleAll ? 'Editor' : 'Viewer'}
          alignIndicator="left"
          checked={toggleAll}
          onChange={event => handleAllToggleAccess(event.target.checked)}
          className={classNames(classes['switch'], classes['default-switch'])}
        />
      </span>
      <br></br>
      <span className={classes['span']}>
        Default role on join:
        <Switch
          labelElement={defaultRole ? 'Editor' : 'Viewer'}
          alignIndicator="left"
          checked={defaultRole}
          onChange={event => handleDefaultToggleAccess(event.target.checked)}
          className={classNames(classes['switch'], classes['default-switch'])}
        />
      </span>
      <HTMLTable compact className={classes['table']}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(users).map(([userId, user], index) => (
            <tr key={userId}>
              <td className={classNames(Classes.INTERACTIVE, classes['left-cell'])}>
                <div style={{ backgroundColor: user.color }} className={classes['user-icon']} />
                <div>{user.name}</div>
              </td>
              <td className={classes['right-cell']}>
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
                  className={classes['switch']}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </>
  );
}

type Props = {
  users: Record<string, SharedbAceUser>;
  playgroundCode: string;
  readOnly: boolean;
};

const SideContentSessionManagement: React.FC<Props> = ({ users, playgroundCode, readOnly }) => {
  useEffect(() => {
    const icon = document.querySelector('.bp5-icon-people');
    icon?.classList.add('side-content-tab-alert');
    // TODO: currently blinking not working as expected
  });
  if (Object.values(users).length === 0) return;
  const myself = Object.values(users)[0];

  return (
    <div className={classes['table-container']}>
      <span className={classes['span']}>
        This is the session management tab. Add users by sharing the session code. If you are the
        owner of this session, you can manage users' access levels from the table below.
      </span>
      <br></br>
      <span className={classes['span']}>
        Session code:
        <CopyToClipboard
          text={playgroundCode}
          onCopy={() => showSuccessMessage('Session code copied!')}
        >
          <div className={classes['session-code']}>
            {' '}
            {playgroundCode} <Icon icon={IconNames.DUPLICATE} />
          </div>
        </CopyToClipboard>
      </span>
      <br></br>
      <span className={classes['span']}>
        Number of users in the session: {Object.entries(users).length}
      </span>
      <div className="session-management-table">
        {myself.role === CollabEditingAccess.OWNER ? (
          <AdminView users={users} defaultReadOnly={readOnly} playgroundCode={playgroundCode} />
        ) : (
          <HTMLTable compact className={classes['table']}>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(users).map((user, index) => {
                return (
                  <tr key={user.color}>
                    <td className={classNames(Classes.INTERACTIVE, classes['left-cell'])}>
                      <div
                        style={{ backgroundColor: user.color }}
                        className={classes['user-icon']}
                      />
                      <div>{user.name}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </HTMLTable>
        )}
      </div>
    </div>
  );
};

export default SideContentSessionManagement;
