import {
  Button,
  Callout,
  Classes,
  FormGroup,
  H2,
  H4,
  HTMLSelect,
  Icon,
  Intent,
  Popover,
  Position
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { uniqBy } from 'lodash';
import React from 'react';
import { useCSVReader } from 'react-papaparse';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';

import Constants from '../../../../commons/utils/Constants';

type Props = {
  handleAddNewUsersToCourse: (users: NameUsernameRole[], provider: string) => void;
};

export type NameUsernameRole = {
  name: string;
  username: string;
  role: StoriesRole;
};

const columnDefs: ColDef<NameUsernameRole>[] = [
  { headerName: 'Name', field: 'name' },
  { headerName: 'Username', field: 'username' },
  { headerName: 'Role', field: 'role' }
];

const defaultColumnDefs: ColDef = {
  flex: 1,
  filter: true,
  resizable: true,
  sortable: true
};

const AddStoriesUserPanel: React.FC<Props> = props => {
  const [users, setUsers] = React.useState<NameUsernameRole[]>([]);
  const [invalidCsvMsg, setInvalidCsvMsg] = React.useState<string | JSX.Element>('');
  const { CSVReader } = useCSVReader();

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout="autoHeight"
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        rowData={users}
        rowHeight={36}
        suppressCellFocus={true}
        suppressMovableColumns={true}
        pagination
      />
    </div>
  );

  const htmlSelectOptions = [...Constants.authProviders.entries()].map(([id, _]) => id);
  const [provider, setProvider] = React.useState(htmlSelectOptions[0]);

  const validateCsvInput = (results: any) => {
    const { data, errors }: { data: string[][]; errors: any[] } = results;

    // react-papaparse upload errors
    if (!!errors.length) {
      setInvalidCsvMsg(
        'Error detected while uploading the CSV file! Please recheck the file and try again.'
      );
      return;
    }

    /**
     * Begin CSV validation.
     *
     * Terminate early if validation errors are encountered, and do not add to existing
     * valid uploaded entries in the table
     */
    const processed: NameUsernameRole[] = [...users];

    if (data.length + users.length > 1000) {
      setInvalidCsvMsg('Please limit each upload to 1000 entries!');
      return;
    }

    for (let i = 0; i < data.length; i++) {
      // Incorrect number of columns
      if (data[i].length !== 3) {
        setInvalidCsvMsg(
          <>
            <div>
              Invalid format (line {i})! Please ensure that the name, username and role is specified
              for each row entry!
            </div>
            <br />
            <div>
              Format: <i>name,username,role</i>
            </div>
            <br />
            <div>(please hover over the question mark above for more details)</div>
          </>
        );
        return;
      }
      // Invalid role specified
      if (!Object.values(StoriesRole).includes(data[i][2] as StoriesRole)) {
        setInvalidCsvMsg(
          `Invalid role (line ${i})! Please ensure that the third column of each entry contains one of the following: 'member, moderator, admin'`
        );
        return;
      }
    }

    data.forEach(e => {
      processed.push({
        name: e[0],
        username: e[1],
        role: e[2] as StoriesRole
      });
    });

    // Check for duplicate usernames in data
    if (uniqBy(processed, val => val.username).length !== processed.length) {
      setInvalidCsvMsg('There are duplicate usernames in the uploaded CSV(s)!');
      return;
    }

    // No validation errors
    setUsers(processed);
    setInvalidCsvMsg('');
  };

  const submitHandler = () => {
    props.handleAddNewUsersToCourse(users, provider);
    setUsers([]);
    setProvider(htmlSelectOptions[0]);
  };

  return (
    <div className="add-users">
      <H2>Add Stories Users</H2>
      {grid}
      <H4>Upload a CSV file to mass insert or update users in your course.</H4>
      <div className="upload-container">
        <div>
          <div className="upload-settings">
            <div className="file-input">
              <CSVReader
                onUploadAccepted={(results: any) => validateCsvInput(results)}
                config={{
                  delimiter: ',',
                  skipEmptyLines: true
                }}
              >
                {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }: any) => (
                  <>
                    <label className={Classes.FILE_INPUT} {...getRootProps()}>
                      <div style={{ minWidth: 250 }}> </div>
                      <span className={Classes.FILE_UPLOAD_INPUT}>Upload CSV</span>
                    </label>
                    <Popover
                      content={
                        <div>
                          <p>
                            <u>CSV Format</u>: &nbsp;
                            <b>
                              <i>name,username,role</i>
                            </b>
                          </p>
                          <p>
                            <b>
                              <i>name</i>
                            </b>
                            : the name of the user
                          </p>
                          <p>
                            <b>
                              <i>username</i>
                            </b>
                            : username of the user in the corresponding authentication
                          </p>
                          <p>
                            <b>
                              <i>role</i>
                            </b>
                            : the role of the user <i>(member | moderator | admin)</i>
                          </p>

                          <p>&nbsp;</p>
                          <p>
                            <u>Examples:</u>
                          </p>
                          <p>
                            <i>(Luminus): &nbsp; Wei Kai,e1234567,member</i>
                          </p>
                          <p>
                            <i>(Google): &nbsp; Timothy,learner@gmail.com,moderator</i>
                          </p>
                          <p>
                            <i>(GitHub): &nbsp; Mingkai,ghusername,admin</i>
                          </p>
                        </div>
                      }
                      interactionKind="hover"
                      position={Position.TOP}
                      popoverClassName="file-input-popover"
                    >
                      <Icon icon={IconNames.HELP} className="file-input-icon" />
                    </Popover>
                  </>
                )}
              </CSVReader>
            </div>

            <FormGroup
              className="html-select"
              label={
                <div className="html-select-label">
                  <div>Authentication Provider</div>
                  <Popover
                    content="The authentication provider your learners will use to log in with"
                    interactionKind="hover-target"
                    position={Position.TOP}
                    popoverClassName="html-select-popover"
                  >
                    <Icon icon={IconNames.HELP} className="html-select-label-icon" />
                  </Popover>
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
        text="Add Stories Users"
        intent={users.length === 0 ? Intent.NONE : Intent.WARNING}
        onClick={submitHandler}
      />
    </div>
  );
};

export default AddStoriesUserPanel;
