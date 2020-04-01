import {
  Button,
  Card,
  Classes,
  Divider,
  Elevation,
  FormGroup,
  InputGroup,
  NonIdealState,
  OverflowList,
  Spinner
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-material.css';
import * as classNames from 'classnames';
import { sortBy } from 'lodash';
import * as React from 'react';

import { getStandardDateTime } from '../../utils/dateHelpers';
import { controlButton } from '../commons';
import DeleteCell from './DeleteCell';
import DownloadCell from './DownloadCell';
import { DirectoryData, MaterialData } from './storyShape';

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

export interface IOwnProps {
  handleCreateMaterialFolder?: (title: string) => void;
  handleDeleteMaterial?: (id: number) => void;
  handleDeleteMaterialFolder?: (id: number) => void;
  handleFetchMaterialIndex: (id?: number) => void;
  handleFetchTestStories: () => void;
  materialDirectoryTree: DirectoryData[] | null;
  materialIndex: MaterialData[] | null;
}

class StoryTable extends React.Component<IMaterialTableProps, State> {
  private gridApi?: GridApi;

  public constructor(props: IMaterialTableProps) {
    super(props);

    this.state = {
      columnDefs: [
        {
          headerName: 'Title',
          field: 'title',
          cellRendererFramework: DownloadCell,
          cellRendererParams: {
            handleFetchMaterialIndex: this.props.handleFetchMaterialIndex
          },
          width: 800,
          suppressMovable: true,
          suppressMenu: true,
          autoHeight: true,
          cellStyle: {
            'text-align': 'left'
          }
        },
        {
          headerName: 'Uploader',
          field: 'uploader.name',
          width: 400,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Date',
          valueGetter: params => getStandardDateTime(params.data.inserted_at),
          width: 400,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Delete',
          field: '',
          cellRendererFramework: DeleteCell,
          cellRendererParams: {
            handleDeleteMaterial: this.props.handleDeleteMaterial,
            handleDeleteMaterialFolder: this.props.handleDeleteMaterialFolder
          },
          width: 150,
          suppressSorting: true,
          suppressMovable: true,
          suppressMenu: true,
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
    this.props.handleFetchTestStories();
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
    const data = sortBy(this.props.materialIndex, [(a: any) => -a.url]);
    const grid = (
      <div className="MaterialContainer">
        <div>
          <h4>Story XML files</h4>
          <FormGroup label="" labelFor="text-input">
            <InputGroup
              id="searchBar"
              large={false}
              leftIcon="search"
              placeholder="Search"
              value={this.state.filterValue}
              onChange={this.handleFilterChange}
            />
            <div style={{ float: 'left', marginTop: 10 }}>
              <OverflowList
                className={Classes.BREADCRUMBS}
                items={
                  this.props.materialDirectoryTree
                    ? [{ id: -1, title: 'Home' }].concat(this.props.materialDirectoryTree)
                    : []
                }
                visibleItemRenderer={this.renderBreadcrumb}
              />
            </div>
          </FormGroup>
        </div>
        <Divider />
        <div className="Material">
          <div className="ag-grid-parent ag-theme-material">
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
        <Button icon={IconNames.MOUNTAIN} onClick={this.handleTest}>
          <div className="ag-grid-button-text hidden-xs">Open Game in new Window</div>
        </Button>
        {"  "}
        <Button icon={IconNames.DOWNLOAD} onClick={this.handleReset}>
          <div className="ag-grid-button-text hidden-xs">Load XML files from AWS</div>
        </Button>
      </div>
    );
    return (
      <Card className="contentdisplay-content" elevation={Elevation.THREE}>
        {this.props.materialIndex === undefined ? loadingDisplay : grid}
      </Card>
    );
  }

  private renderBreadcrumb = (data: DirectoryData, index: number) => {
    return (
      <span className={classNames(Classes.BREADCRUMB, Classes.BREADCRUMB_CURRENT)} key={index}>
        {controlButton(`${data.title}`, IconNames.CHEVRON_RIGHT, () =>
          this.props.handleFetchMaterialIndex(data.id)
        )}
      </span>
    );
  };

  private handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changeVal = event.target.value;
    this.setState({ filterValue: changeVal });

    if (this.gridApi) {
      this.gridApi.setQuickFilter(changeVal);
    }
  };

  private handleTest = () => {
    window.open("/academy/game");
  };

  private handleReset = () => {
    window.alert("Are you sure you want to discard all changes made?");
  };

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    window.onresize = () => this.gridApi!.sizeColumnsToFit();
  };
}

export default StoryTable;
