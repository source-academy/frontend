import { FileInput, FormGroup, H2, HTMLSelect, Icon, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { uniqBy } from 'lodash';
import React from 'react';
import { CSVReader } from 'react-papaparse';
import { Role } from 'src/commons/application/ApplicationTypes';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';

import Constants from '../../../../commons/utils/Constants';

export type AddUserPanelProps = OwnProps;

type OwnProps = {
  //   handleAddUsers: (users: ) => void;
};

type UsernameAndRole = {
  username: string;
  role: Role;
};

const AddUserPanel: React.FC<AddUserPanelProps> = props => {
  // Tracks the username, role objects
  const [users, setUsers] = React.useState<UsernameAndRole[]>([]);
  const gridApi = React.useRef<GridApi>();

  const columnDefs = [
    {
      headerName: 'Username',
      field: 'username'
    },
    {
      headerName: 'Role',
      field: 'role'
    }
  ];

  const defaultColumnDefs = {
    filter: true,
    resizable: true
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
        suppressPaginationPanel={true}
      />
    </div>
  );

  const htmlSelectOptions = [...Constants.authProviders.entries()].map(([id, _]) => id);
  const [provider, setProvider] = React.useState(htmlSelectOptions[0]);

  const csvRef = React.useRef<CSVReader>(null);

  const validateCsvInput = (data: any[]) => {
    let hasInvalidInput = false;
    const processed: UsernameAndRole[] = [...users];

    data.forEach(e => {
      if (e.data.length !== 2 || !Object.values(Role).includes(e.data[1])) {
        hasInvalidInput = true;
        return;
      }

      processed.push({ username: e.data[0], role: e.data[1] });
    });

    if (hasInvalidInput) {
      showWarningMessage('Invalid entries have been ignored!');
    }
    setUsers(uniqBy(processed, val => val.username));
  };

  return (
    <div className="add-users">
      <H2>Add Users</H2>
      {grid}
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
                      </p>
                      <p>
                        <b>
                          <i>username</i>
                        </b>
                        : the username of the learner in the corresponding authentication provider
                      </p>
                      <p>
                        <b>
                          <i>role</i>
                        </b>
                        : the role of the learner in this course <i>(admin | staff | student)</i>
                      </p>
                      <p>
                        <i>(Luminus): &nbsp;E1234567,student</i>
                      </p>
                      <p>
                        <i>(Google): &nbsp;learner@gmail.com,staff</i>
                      </p>
                      <p>
                        <i>(GitHub): &nbsp;ghusername,admin</i>
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
    </div>
  );
};

export default AddUserPanel;
