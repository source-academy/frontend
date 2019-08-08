import {
  Card,
  Classes,
  Dialog,
  Divider,
  EditableText,
  Elevation,
  FormGroup,
  InputGroup,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
import { sortBy } from 'lodash';
import * as React from 'react';

import { controlButton } from '../../commons';
import DeleteCell from './DeleteCell';
import DownloadCell from './DownloadCell';
import { MaterialData } from './materialShape';

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[];
  dialogOpen: boolean;
  filterValue: string;
  groupFilterEnabled: boolean;
  newFolderName: string;
};

type IMaterialTableProps = IOwnProps;

interface IOwnProps {
  handleCreateMaterialFolder?: (name: string) => void;
  handleDeleteMaterial?: (id: number) => void;
  handleFetchMaterialIndex: () => void;
  materialIndex: MaterialData[] | null;
}

class MaterialTable extends React.Component<IMaterialTableProps, State> {
  private gridApi?: GridApi;

  public constructor(props: IMaterialTableProps) {
    super(props);

    this.state = {
      columnDefs: [
        {
          headerName: 'Title',
          field: 'title',
          maxWidth: 800,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Uploader',
          field: 'uploader.name',
          maxWidth: 400,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Download',
          field: '',
          cellRendererFramework: DownloadCell,
          cellRendererParams: {},
          maxWidth: 400,
          suppressSorting: true,
          suppressMovable: true,
          suppressMenu: true,
          suppressResize: true,
          cellStyle: {
            padding: 0
          }
        },
        {
          headerName: 'Delete',
          field: '',
          cellRendererFramework: DeleteCell,
          cellRendererParams: {
            handleDeleteMaterial: this.props.handleDeleteMaterial
          },
          maxWidth: 400,
          suppressSorting: true,
          suppressMovable: true,
          suppressMenu: true,
          suppressResize: true,
          cellStyle: {
            padding: 0
          },
          hide: !this.props.handleDeleteMaterial
        },
        { headerName: 'description', field: 'description', hide: true },
        { headerName: 'inserted_at', field: 'inserted_at', hide: true },
        { headerName: 'updated_at', field: 'updated_at', hide: true },
        { headerName: 'url', field: 'url', hide: true }
      ],
      dialogOpen: false,
      filterValue: '',
      groupFilterEnabled: false,
      newFolderName: ''
    };
  }

  public componentDidMount() {
    this.props.handleFetchMaterialIndex();
  }

  public render() {
    /* Display either a loading screen or a table with overviews. */
    const loadingDisplay = (
      <NonIdealState
        className="Material"
        description="Fetching material index..."
        icon={<Spinner size={Spinner.SIZE_LARGE} />}
      />
    );
    const data = sortBy(this.props.materialIndex, [(a: any) => -a.id]);
    const grid = (
      <div className="MaterialContainer">
        <div>
          <FormGroup label="" labelFor="text-input">
            <InputGroup
              id="searchBar"
              large={false}
              leftIcon="search"
              placeholder="Search"
              value={this.state.filterValue}
              onChange={this.handleFilterChange}
            />
            {this.props.handleCreateMaterialFolder && (
              <div style={{ float: 'right', marginTop: 10 }}>
                {controlButton('Add New Folder', IconNames.PLUS, this.handleOpenDialog)}
              </div>
            )}
            {this.props.handleCreateMaterialFolder && (
              <Dialog
                icon="info-sign"
                isOpen={this.state.dialogOpen}
                onClose={this.handleCloseDialog}
                title="Add New Folder"
                canOutsideClickClose={true}
              >
                <div className={Classes.DIALOG_BODY}>
                  <EditableText
                    className="Input"
                    intent="none"
                    maxLines={1}
                    minLines={1}
                    multiline={true}
                    placeholder="Enter folder name..."
                    selectAllOnFocus={true}
                    value={this.state.newFolderName}
                    onChange={this.handleSetFolderName}
                  />
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                  <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    {controlButton(
                      'Confirm',
                      IconNames.TICK,
                      this.handleCreateMaterialFolder,
                      {},
                      !this.state.newFolderName
                    )}
                    {controlButton('Cancel', IconNames.CROSS, this.handleCloseDialog)}
                  </div>
                </div>
              </Dialog>
            )}
          </FormGroup>
        </div>
        <Divider />
        <div className="Material">
          <div className="ag-grid-parent ag-theme-balham">
            <AgGridReact
              gridAutoHeight={true}
              enableColResize={true}
              enableSorting={true}
              enableFilter={true}
              columnDefs={this.state.columnDefs}
              onGridReady={this.onGridReady}
              rowData={data}
              pagination={true}
              paginationPageSize={50}
              suppressMovableColumns={true}
            />
          </div>
        </div>
      </div>
    );
    return (
      <Card className="contentdisplay-content" elevation={Elevation.THREE}>
        {this.props.materialIndex === undefined ? loadingDisplay : grid}
      </Card>
    );
  }

  private handleCloseDialog = () => this.setState({ dialogOpen: false, newFolderName: '' });
  private handleOpenDialog = () => this.setState({ dialogOpen: true });
  private handleSetFolderName = (value: string) => this.setState({ newFolderName: value });
  private handleCreateMaterialFolder = () =>
    this.props.handleCreateMaterialFolder!(this.state.newFolderName);

  private handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changeVal = event.target.value;
    this.setState({ filterValue: changeVal });

    if (this.gridApi) {
      this.gridApi.setQuickFilter(changeVal);
    }
  };

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  };
}

export default MaterialTable;
