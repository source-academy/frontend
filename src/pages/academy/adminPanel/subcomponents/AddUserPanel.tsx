import {
  Button,
  Callout,
  FileInput,
  FormGroup,
  H2,
  H4,
  HTMLSelect,
  Icon,
  Intent,
  Position
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { uniqBy } from 'lodash';
import React from 'react';
import { CSVReader } from 'react-papaparse';
import { Role } from 'src/commons/application/ApplicationTypes';

import Constants from '../../../../commons/utils/Constants';

export type AddUserPanelProps = OwnProps;

type OwnProps = {
  handleAddNewUsersToCourse: (users: UsernameRoleGroup[], provider: string) => void;
};

export type UsernameRoleGroup = {
  username: string;
  role: Role;
  group?: string;
};

const AddUserPanel: React.FC<AddUserPanelProps> = props => {
  const [users, setUsers] = React.useState<UsernameRoleGroup[]>([]);
  const [invalidCsvMsg, setInvalidCsvMsg] = React.useState<string | JSX.Element>('');
  const gridApi = React.useRef<GridApi>();

  const columnDefs = [
    {
      headerName: 'Username',
      field: 'username'
    },
    {
      headerName: 'Role',
      field: 'role'
    },
    {
      headerName: 'Group',
      field: 'group'
    }
  ];

  const defaultColumnDefs = {
    filter: true,
    resizable: true,
    sortable: true
  };

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        onGridSizeChanged={() => gridApi.current?.sizeColumnsToFit()}
        rowData={users}
        rowHeight={36}
        suppressCellSelection={true}
        suppressMovableColumns={true}
        pagination
      />
    </div>
  );

  const htmlSelectOptions = [...Constants.authProviders.entries()].map(([id, _]) => id);
  const [provider, setProvider] = React.useState(htmlSelectOptions[0]);

  const csvRef = React.useRef<CSVReader>(null);

  const validateCsvInput = (data: any[]) => {
    const processed: UsernameRoleGroup[] = [...users];
    let hasInvalidInput = false;

    if (data.length + users.length > 1000) {
      setInvalidCsvMsg('Please limit each upload to 1000 entries!');
      hasInvalidInput = true;
    }

    for (const e of data) {
      // Incorrect number of columns
      if (!(e.data.length === 2 || e.data.length === 3)) {
        setInvalidCsvMsg(
          <>
            <div>
              Invalid format! Please ensure that the username and role is specified for each row
              entry!
            </div>
            <br />
            <div>
              Format: <i>username,role</i> <b>OR</b> <i>username,role,group</i>
            </div>
            <br />
            <div>(please hover over the question mark above for more details)</div>
          </>
        );
        hasInvalidInput = true;
        break;
      }
      // Invalid role specified
      if (!Object.values(Role).includes(e.data[1])) {
        setInvalidCsvMsg(
          'Invalid role! Please ensure that the second column of each entry contains one of the following: admin, staff, student'
        );
        hasInvalidInput = true;
        break;
      }
    }

    if (!hasInvalidInput) {
      data.forEach(e => {
        processed.push({
          username: e.data[0],
          role: e.data[1],
          group: e.data[2]
        });
      });

      // Check for duplicate usernames in data
      if (uniqBy(processed, val => val.username).length !== processed.length) {
        setInvalidCsvMsg('There are duplicate usernames in the uploaded CSV(s)!');
      } else {
        setUsers(processed);
        setInvalidCsvMsg('');
      }
    }
  };

  const submitHandler = () => {
    props.handleAddNewUsersToCourse(users, provider);
    setUsers([]);
    setProvider(htmlSelectOptions[0]);
  };

  return (
    <div className="add-users">
      <H2>Add Users</H2>
      {grid}
      <H4>Upload a CSV file to mass insert or update users in your course.</H4>
      <div className="upload-container">
        <div>
          <div className="upload-settings">
            <div className="file-input">
              <CSVReader
                ref={csvRef}
                onFileLoad={data => validateCsvInput(data)}
                noClick
                noDrag
                noProgressBar
                config={{
                  delimiter: ',',
                  skipEmptyLines: true
                }}
              >
                {({ file }: { file: any }) => (
                  <>
                    <FileInput
                      text="Upload CSV"
                      onClick={e => {
                        if (csvRef.current) csvRef.current?.open(e);
                      }}
                    />
                    <Popover2
                      content={
                        <div>
                          <p>
                            <u>CSV Format</u>: &nbsp;
                            <b>
                              <i>username,role</i>
                            </b>
                            &nbsp;&nbsp;OR&nbsp;&nbsp;
                            <b>
                              <i>username,role,group</i>
                            </b>
                          </p>
                          <p>
                            <b>
                              <i>username</i>
                            </b>
                            : the username of the learner in the corresponding authentication
                            provider
                          </p>
                          <p>
                            <b>
                              <i>role</i>
                            </b>
                            : the role of the learner in this course{' '}
                            <i>(admin | staff | student)</i>
                          </p>
                          <p>
                            <b>
                              <i>group (optional)</i>
                            </b>
                            : the group name that the learner belongs to in this course
                          </p>
                          <p>
                            <i>
                              (*Note that staff or admin will automatically be assigned as group
                              leader and each group
                            </i>
                          </p>
                          <p>
                            <i>
                              can only have one leader. If there are duplicates the latest entry
                              will take effect)
                            </i>
                          </p>

                          <p>&nbsp;</p>
                          <p>
                            <u>Examples:</u>
                          </p>
                          <p>
                            <i>
                              (Luminus): &nbsp;e1234567,student &nbsp;•&nbsp;
                              e1234567,student,Group1
                            </i>
                          </p>
                          <p>
                            <i>
                              (Google): &nbsp;learner@gmail.com,staff &nbsp;•&nbsp;
                              learner@gmail.com,staff,Group1
                            </i>
                          </p>
                          <p>
                            <i>
                              (GitHub): &nbsp;ghusername,admin &nbsp;•&nbsp; ghusername,admin,Group1
                            </i>
                          </p>
                        </div>
                      }
                      interactionKind="hover"
                      position={Position.TOP}
                      popoverClassName="file-input-popover"
                    >
                      <Icon icon={IconNames.HELP} className="file-input-icon" />
                    </Popover2>
                  </>
                )}
              </CSVReader>
            </div>

            <FormGroup
              className="html-select"
              label={
                <div className="html-select-label">
                  <div>Authentication Provider</div>
                  <Popover2
                    content="The authentication provider your learners will use to log in with"
                    interactionKind="hover-target"
                    position={Position.TOP}
                    popoverClassName="html-select-popover"
                  >
                    <Icon icon={IconNames.HELP} className="html-select-label-icon" />
                  </Popover2>
                </div>
              }
              inline
            >
              <HTMLSelect
                options={htmlSelectOptions}
                value={provider}
                onChange={e => setProvider(e.target.value)}
              />
            </FormGroup>
          </div>
          {invalidCsvMsg && (
            <Callout intent={Intent.DANGER} title="Invalid CSV file provided!">
              {invalidCsvMsg}
            </Callout>
          )}
        </div>
      </div>
      <Button
        className="add-button"
        text="Add Users"
        intent={users.length === 0 ? Intent.NONE : Intent.WARNING}
        onClick={submitHandler}
      />
    </div>
  );
};

export default AddUserPanel;
