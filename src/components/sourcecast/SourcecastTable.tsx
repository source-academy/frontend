import { Divider, FormGroup, InputGroup, NonIdealState, Spinner } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
import { sortBy } from 'lodash';
import * as React from 'react';

import ContentDisplay from '../commons/ContentDisplay';
import SelectCell from './SelectCell';
import { IPlaybackData, ISourcecastData } from './sourcecastShape';

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[];
  filterValue: string;
  groupFilterEnabled: boolean;
};

type ISourcecastTableProps = IOwnProps;

interface IOwnProps {
  handleFetchSourcecastIndex: () => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
    audioUrl: string,
    playbackData: IPlaybackData
  ) => void;
  sourcecastIndex: ISourcecastData[] | null;
}

class SourcecastTable extends React.Component<ISourcecastTableProps, State> {
  private gridApi?: GridApi;

  public constructor(props: ISourcecastTableProps) {
    super(props);

    this.state = {
      columnDefs: [
        {
          headerName: 'Title',
          field: 'title',
          width: 200,
          maxWidth: 200,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Uploader',
          field: 'uploader.name',
          width: 200,
          maxWidth: 200,
          suppressMovable: true,
          suppressMenu: true
        },
        {
          headerName: 'Select',
          field: '',
          cellRendererFramework: SelectCell,
          cellRendererParams: {
            handleSetSourcecastData: this.props.handleSetSourcecastData
          },
          width: 200,
          maxWidth: 200,
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
        { headerName: 'audio', field: 'audio', hide: true },
        { headerName: 'playbackData', field: 'playbackData', hide: true },
        { headerName: 'url', field: 'url', hide: true }
      ],
      filterValue: '',
      groupFilterEnabled: false
    };
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
    const data = sortBy(this.props.sourcecastIndex, [(a: ISourcecastData) => -a.id]);

    const grid = (
      <div className="SourcecastContainer">
        <br />
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
        <div className="SourcecastTable">
          <div className="ag-grid-parent ag-theme-fresh">
            <AgGridReact
              gridAutoHeight={true}
              enableColResize={true}
              enableSorting={true}
              enableFilter={true}
              columnDefs={this.state.columnDefs}
              onGridReady={this.onGridReady}
              rowData={data}
              pagination={false}
              paginationPageSize={50}
            />
          </div>
        </div>
        <br />
      </div>
    );
    return (
      <div>
        <ContentDisplay
          loadContentDispatch={this.props.handleFetchSourcecastIndex}
          display={this.props.sourcecastIndex === undefined ? loadingDisplay : grid}
          fullWidth={false}
        />
      </div>
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

export default SourcecastTable;
