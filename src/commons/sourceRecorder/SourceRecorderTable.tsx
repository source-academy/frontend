import 'ag-grid-community/styles/ag-grid.css';

import {
  Divider,
  FormGroup,
  InputGroup,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { sortBy } from 'lodash';
import React from 'react';

import { PlaybackData, SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import { getStandardDate } from '../utils/DateHelper';
import SourcastDeleteCell from './SourceRecorderDeleteCell';
import SourceRecorderSelectCell from './SourceRecorderSelectCell';
import SourceRecorderShareCell from './SourceRecorderShareCell';

type SourceRecorderTableProps = OwnProps;

type OwnProps = {
  handleDeleteSourcecastEntry?: (id: number) => void;
  handleSetSourcecastData?: (
    title: string,
    description: string,
    uid: string,
    audioUrl: string,
    playbackData: PlaybackData
  ) => void;
  sourcecastIndex: SourcecastData[] | null;
  courseId?: number;
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

class SourcecastTable extends React.Component<SourceRecorderTableProps, State> {
  private defaultColumnDefs: ColDef;
  private gridApi?: GridApi;

  public constructor(props: SourceRecorderTableProps) {
    super(props);

    this.state = {
      columnDefs: [
        {
          headerName: 'Title',
          field: 'title',
          cellRenderer: SourceRecorderSelectCell,
          cellRendererParams: {
            handleSetSourcecastData: this.props.handleSetSourcecastData
          },
          minWidth: 200,
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
          minWidth: 100,
          suppressMovable: true,
          suppressMenu: true,
          hide: !!this.props.handleSetSourcecastData
        },
        {
          headerName: 'Uploader',
          field: 'uploader.name',
          minWidth: 150,
          suppressMovable: true,
          suppressMenu: true,
          cellStyle: {
            'text-align': 'center'
          }
        },
        {
          headerName: 'Date',
          valueGetter: params => getStandardDate(params.data.inserted_at),
          minWidth: 150,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Share',
          field: 'uid',
          cellRenderer: SourceRecorderShareCell,
          cellRendererParams: {
            courseId: this.props.courseId
          },
          minWidth: 80,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Delete',
          field: '',
          cellRenderer: SourcastDeleteCell,
          cellRendererParams: {
            handleDeleteSourcecastEntry: this.props.handleDeleteSourcecastEntry
          },
          minWidth: 100,
          maxWidth: 100,
          sortable: false,
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

    this.defaultColumnDefs = {
      filter: true,
      resizable: true,
      sortable: true
    };
  }

  public render() {
    /* Display either a loading screen or a table with overviews. */
    const loadingDisplay = (
      <NonIdealState
        className="Sourcecast"
        description="Fetching sourcecast index..."
        icon={<Spinner size={SpinnerSize.LARGE} />}
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
              domLayout="autoHeight"
              columnDefs={this.state.columnDefs}
              defaultColDef={this.defaultColumnDefs}
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
      this.gridApi.setGridOption('quickFilterText', changeVal);
    }
  };

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    window.onresize = () => this.gridApi!.sizeColumnsToFit();
  };
}

export default SourcecastTable;
