import {
  Card,
  Divider,
  Elevation,
  FormGroup,
  InputGroup,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
import { sortBy } from 'lodash';
import * as React from 'react';

import DeleteCell from './DeleteCell';
import DownloadCell from './DownloadCell';
import { MaterialData } from './materialShape';

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[];
  filterValue: string;
  groupFilterEnabled: boolean;
};

type IMaterialTableProps = IOwnProps;

interface IOwnProps {
  handleDeleteMaterial: (id: number) => void;
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
          }
        },
        { headerName: 'description', field: 'description', hide: true },
        { headerName: 'inserted_at', field: 'inserted_at', hide: true },
        { headerName: 'updated_at', field: 'updated_at', hide: true },
        { headerName: 'url', field: 'url', hide: true }
      ],
      filterValue: '',
      groupFilterEnabled: false
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
          <FormGroup label="" labelFor="text-input" inline={true}>
            <InputGroup
              id="searchBar"
              large={false}
              leftIcon="search"
              placeholder="Search"
              value={this.state.filterValue}
              onChange={this.handleFilterChange}
            />
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
