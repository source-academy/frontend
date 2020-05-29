import { Divider, FormGroup, InputGroup, NonIdealState, Spinner } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import { sortBy } from 'lodash';
import * as React from 'react';

import { PlaybackData, SourcecastData } from '../../features/sourcecast/SourcecastTypes';
import { getStandardDate } from '../utils/DateHelper';
import SourcastDeleteCell from './SourcecastDeleteCell';
import SourcecastSelectCell from './SourcecastSelectCell';

type SourcecastTableProps = OwnProps;

type OwnProps = {
  handleDeleteSourcecastEntry?: (id: number) => void;
  handleFetchSourcecastIndex: () => void;
  handleSetSourcecastData?: (
    title: string,
    description: string,
    audioUrl: string,
    playbackData: PlaybackData
  ) => void;
  sourcecastIndex: SourcecastData[] | null;
};

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[];
  filterValue: string;
  groupFilterEnabled: boolean;
};

class SourcecastTable extends React.Component<SourcecastTableProps, State> {
  private gridApi?: GridApi;

  public constructor(props: SourcecastTableProps) {
    super(props);

    this.state = {
      columnDefs: [
        {
          headerName: 'Title',
          field: 'title',
          cellRendererFramework: SourcecastSelectCell,
          cellRendererParams: {
            handleSetSourcecastData: this.props.handleSetSourcecastData
          },
          width: 400,
          suppressMovable: true,
          suppressMenu: true,
          cellStyle: {
            'text-align': 'left'
          },
          hide: !this.props.handleSetSourcecastData
        },
        {
          headerName: 'Title',
          field: 'title',
          width: 200,
          suppressMovable: true,
          suppressMenu: true,
          hide: !!this.props.handleSetSourcecastData
        },
        {
          headerName: 'Uploader',
          field: 'uploader.name',
          width: 200,
          suppressMovable: true,
          suppressMenu: true,
          cellStyle: {
            'text-align': 'center'
          }
        },
        {
          headerName: 'Date',
          valueGetter: params => getStandardDate(params.data.inserted_at),
          maxWidth: 200,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Delete',
          field: '',
          cellRendererFramework: SourcastDeleteCell,
          cellRendererParams: {
            handleDeleteSourcecastEntry: this.props.handleDeleteSourcecastEntry
          },
          width: 100,
          maxWidth: 100,
          suppressSorting: true,
          suppressMovable: true,
          suppressMenu: true,
          cellStyle: {
            'text-align': 'center'
          },
          hide: !this.props.handleDeleteSourcecastEntry
        },
        { headerName: 'description', field: 'description', hide: true },
        { headerName: 'inserted_at', field: 'inserted_at', hide: true },
        { headerName: 'updated_at', field: 'updated_at', hide: true },
        { headerName: 'audio', field: 'audio', hide: true },
        { headerName: 'playbackData', field: 'playbackData', hide: true },
        { headerName: 'url', field: 'url', hide: true }
      ],
      filterValue: '',
      groupFilterEnabled: false
    };
  }

  public componentDidMount() {
    this.props.handleFetchSourcecastIndex();
  }

  public render() {
    /* Display either a loading screen or a table with overviews. */
    const loadingDisplay = (
      <NonIdealState
        className="Sourcecast"
        description="Fetching sourcecast index..."
        icon={<Spinner size={Spinner.SIZE_LARGE} />}
      />
    );
    const data = sortBy(this.props.sourcecastIndex, [(a: SourcecastData) => -a.id]);

    const grid = (
      <div className="SourcecastContainer">
        <br />
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
          </FormGroup>
        </div>
        <Divider />
        <div className="SourcecastTable">
          <div className="ag-grid-parent">
            <AgGridReact
              gridAutoHeight={true}
              enableColResize={true}
              enableSorting={true}
              enableFilter={true}
              columnDefs={this.state.columnDefs}
              onGridReady={this.onGridReady}
              rowData={data}
              rowHeight={30}
              pagination={false}
              paginationPageSize={50}
            />
          </div>
        </div>
        <br />
      </div>
    );
    return <div>{this.props.sourcecastIndex === undefined ? loadingDisplay : grid}</div>;
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
    window.onresize = () => this.gridApi!.sizeColumnsToFit();
  };
}

export default SourcecastTable;
