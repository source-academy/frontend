import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import { Button, Divider, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllUserXp } from 'src/commons/application/actions/SessionActions';
import ContentDisplay from 'src/commons/ContentDisplay';
import { useTypedSelector } from 'src/commons/utils/Hooks';

type RowData = {
  name: string;
  'NUS Net ID': string;
  'Assessment Xp': string;
  'Achievement Xp': string;
};

type PageState = {
  currPage: number;
  maxPages: number;
  rowCountString: string;
  isBackDisabled: boolean;
  isForwardDisabled: boolean;
};

const columnDefs = [
  { field: 'name' },
  { field: 'NUS Net ID' },
  { field: 'Assessment Xp' },
  { field: 'Achievement Xp' }
];

const defaultColDef = {
  resizable: true,
  sortable: true
};

const XpCalculation: React.FC = () => {
  const dispatch = useDispatch();
  const allUserXp = useTypedSelector(state => state.session.allUserXp);

  const [rowData, setRowData] = useState<RowData[]>([]);
  const [gridApi, setGridApi] = useState<GridApi>();
  const [pageState, setPageState] = useState<PageState>({
    currPage: 1,
    maxPages: 1,
    rowCountString: '(none)',
    isBackDisabled: true,
    isForwardDisabled: true
  });

  useEffect(() => {
    if (allUserXp) {
      const rowData = allUserXp.map(data => {
        const [name, nusNetId, assessmentXp, achievementXp] = data;
        return {
          name: name ?? '',
          'NUS Net ID': nusNetId ?? '',
          'Assessment Xp': assessmentXp ?? '0',
          'Achievement Xp': achievementXp ?? '0'
        };
      });
      setRowData(rowData);
    }
  }, [allUserXp]);

  const exportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `SA XP Count (${new Date().toISOString()}).csv`,
        // Explicitly declare exported columns to avoid exporting trash columns
        columnKeys: ['name', 'NUS Net ID', 'Assessment Xp', 'Achievement Xp']
      });
    }
  }, [gridApi]);

  // Forcibly resizes columns to fit the width of the datagrid - prevents datagrid
  // from needing to render a horizontal scrollbar when columns overflow grid width
  const resizeGrid = useCallback(() => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  }, [gridApi]);

  const changePaginationView = useCallback(
    (type: string) => {
      return () => {
        if (gridApi) {
          switch (type) {
            case 'first':
              return gridApi.paginationGoToFirstPage();
            case 'prev':
              return gridApi.paginationGoToPreviousPage();
            case 'next':
              return gridApi.paginationGoToNextPage();
            case 'last':
              return gridApi.paginationGoToLastPage();
            default:
          }
        }
      };
    },
    [gridApi]
  );

  const updatePaginationState = useCallback(() => {
    if (gridApi) {
      const newTotalPages = gridApi.paginationGetTotalPages();
      const newCurrPage = newTotalPages === 0 ? 0 : gridApi.paginationGetCurrentPage() + 1;
      setPageState({
        currPage: newCurrPage,
        maxPages: newTotalPages,
        rowCountString: formatRowCountString(
          25,
          newCurrPage,
          newTotalPages,
          gridApi.paginationGetRowCount()
        ),
        isBackDisabled: newTotalPages === 0 || newCurrPage === 1,
        isForwardDisabled: newTotalPages === 0 || newCurrPage === newTotalPages
      });
    }
  }, [gridApi, setPageState]);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);
      updatePaginationState();
    },
    [setGridApi, updatePaginationState]
  );

  const Controls = () => {
    return (
      <div className="grading-controls">
        <div className="GridControls ag-grid-controls">
          <div style={{ width: '130px' }} className="left-controls"></div>
          <div className="centre-controls">
            <Button
              icon={IconNames.CHEVRON_BACKWARD}
              onClick={changePaginationView('first')}
              minimal={true}
              disabled={pageState.isBackDisabled}
            />
            <Button
              icon={IconNames.CHEVRON_LEFT}
              onClick={changePaginationView('prev')}
              minimal={true}
              disabled={pageState.isBackDisabled}
            />
            <Button className="pagination-details hidden-xs" disabled={true} minimal={true}>
              <div>{`Page ${pageState.currPage} of ${pageState.maxPages}`}</div>
              <div>{pageState.rowCountString}</div>
            </Button>
            <Button
              icon={IconNames.CHEVRON_RIGHT}
              onClick={changePaginationView('next')}
              minimal={true}
              disabled={pageState.isForwardDisabled}
            />
            <Button
              icon={IconNames.CHEVRON_FORWARD}
              onClick={changePaginationView('last')}
              minimal={true}
              disabled={pageState.isForwardDisabled}
            />
          </div>
          <div className="right-controls">
            <Button icon={IconNames.EXPORT} onClick={exportCSV}>
              <span className="hidden-xs">Export to CSV</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }; /* Display either a loading screen or a table with overviews. */
  const LoadingDisplay = (
    <NonIdealState
      className="Grading"
      description="Fetching XP..."
      icon={<Spinner size={SpinnerSize.LARGE} />}
    />
  );

  const Content = (
    <div className="Grading">
      <Controls />
      <Divider />
      <AgGridReact
        domLayout={'autoHeight'}
        className="ag-grid-parent ag-theme-balham"
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onPaginationChanged={updatePaginationState}
        onGridSizeChanged={resizeGrid}
        defaultColDef={defaultColDef}
        rowData={rowData}
        rowHeight={30}
        pagination={true}
        paginationPageSize={20}
        suppressCellFocus={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      />
    </div>
  );

  return (
    <ContentDisplay
      loadContentDispatch={() => dispatch(fetchAllUserXp())}
      display={!allUserXp ? LoadingDisplay : Content}
      fullWidth={false}
    />
  );
};

const formatRowCountString = (
  pageSize: number,
  currPage: number,
  maxPages: number,
  totalRows: number
) => {
  return maxPages === 0
    ? '(none)'
    : currPage !== maxPages
    ? `(#${pageSize * currPage - 19} - #${pageSize * currPage})`
    : `(#${pageSize * currPage - 19} - #${totalRows})`;
};

export default XpCalculation;
