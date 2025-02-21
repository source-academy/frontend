// import {  Switch} from '@blueprintjs/core';
// import { Table, TableCell, TableHead, TableHeaderCell, TableRow} from '@tremor/react';
import React, { useMemo, useState } from 'react';
// import { SessionUser } from '../SideContentTypes';
// import SideContentRoleSelector from './SideContentRoleSelector';
import { Classes, HTMLTable, Switch } from '@blueprintjs/core';
// import { H6 } from '@blueprintjs/core';

type Props = {
    usersArray: any[],
    canManage: boolean
}


const SideContentSessionManagement: React.FC<Props> = ({usersArray, canManage=true}) => {

    console.log(usersArray);

    const [usersAccessLevel, setUsersAccessLevel] = useState<{ id: string, accessLevel: number }[]>([]);
    
    const handleJumpToUser = (id:any) => {
        console.log('do stuff' + id);
    }

    const handleToggleAccess = (id: string) => {
        setUsersAccessLevel(prevLevels =>
            prevLevels.map(user =>
                user.id === id ? { ...user, accessLevel: user.accessLevel === 1 ? 0 : 1 } : user
            )
        );
    };

    useMemo(() => {
        const usersLevels = usersArray.map(user => ({
            id: user.id,
            accessLevel: user.accessLevel || 0
        }));
        setUsersAccessLevel(usersLevels);
    }, [usersArray]);
    
    return (
        <div style={{
            marginInline:'0.5em',
        }}>
            {/* <H6>Manage users in the session</H6> */}
            <HTMLTable className="w-full" compact style={{
                width:'calc(100% - 1em)',
                paddingInline:'0.5em',
                borderSpacing: '0 0.5em',
            }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style={{textAlign:"end"}}>Role</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                {usersArray.map(user => {
                    const userAccess = usersAccessLevel.find(u => u.id === user.id)?.accessLevel || 0;
                    return (
                    <tr key={user.color}> 
                        <td style={{
                            verticalAlign:'middle',
                            display: 'flex',
                            gap: '1em',
                            alignItems: 'center'
                            }}
                            className={Classes.INTERACTIVE}
                            onClick={(e) => handleJumpToUser(user.color)}
                        >
                            <div
                                style={{
                                width: '15px',
                                height: '15px',
                                borderRadius: '50%',
                                backgroundColor: user.color
                                }}
                            />
                            <div>{user.name}</div>
                        </td>
                        <td style={{
                            textAlign: "end",
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}>
                                <Switch 
                                    labelElement={userAccess === 2 ? "Admin" : userAccess === 1 ? "Editor" : "Viewer"}
                                    disabled={!canManage} 
                                    alignIndicator='right'
                                    checked={userAccess >= 1}
                                    onChange={() => handleToggleAccess(user.id)}></Switch>
                            </div>
                            
                        </td>
                    </tr>
                )})}
            </tbody>
                
            </HTMLTable>
        </div>
    )
}

export default SideContentSessionManagement;