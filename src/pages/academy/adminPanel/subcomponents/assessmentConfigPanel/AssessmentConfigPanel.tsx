import { Button, H2 } from '@blueprintjs/core';
import {
  CellValueChangedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  RowDragEvent
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { cloneDeep, isEqual } from 'lodash';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import { WithImperativeApi } from 'src/commons/utils/TypeHelper';

import BooleanCell from './BooleanCell';
import DeleteRowCell from './DeleteRowCell';
import NumericCell from './NumericCell';

const defaultAssessmentConfig: AssessmentConfiguration = {
  assessmentConfigId: -1,
  type: 'untitled',
  isManuallyGraded: true,
  isGradingAutoPublished: false,
  displayInDashboard: true,
  hoursBeforeEarlyXpDecay: 0,
  hasTokenCounter: false,
  hasVotingFeatures: false,
  earlySubmissionXp: 0
};

export type ImperativeAssessmentConfigPanel = {
  getData: () => AssessmentConfiguration[];
  resetData: () => void;
};

type Props = {
  initialConfigs: AssessmentConfiguration[];
  setHasChangesAssessmentConfig: (val: boolean) => void;
};

const defaultColumnDefs: ColDef = {
  flex: 3,
  minWidth: 70,
  filter: false,
  resizable: true,
  sortable: false
};

const AssessmentConfigPanel: WithImperativeApi<
  ImperativeAssessmentConfigPanel,
  React.FC<Props>
> = forwardRef<ImperativeAssessmentConfigPanel, Props>(
  ({ setHasChangesAssessmentConfig, initialConfigs }, imperativeRef) => {
    const gridApi = React.useRef<GridApi<AssessmentConfiguration>>();
    // Create a mutable copy of the initialConfigs to track changes
    // to prevent UI flicker during state changes.
    const tableState = useRef(cloneDeep(initialConfigs));

    const [configs, setConfigs] = useState(initialConfigs);
    useEffect(() => {
      setHasChangesAssessmentConfig(!isEqual(configs, initialConfigs));
    }, [configs, initialConfigs, setHasChangesAssessmentConfig]);

    // Register the imperative API so that parents can access the current data
    useImperativeHandle<ImperativeAssessmentConfigPanel, ImperativeAssessmentConfigPanel>(
      imperativeRef,
      () => ({
        getData: () => configs,
        resetData: () => {
          setConfigs(initialConfigs);
          tableState.current = cloneDeep(initialConfigs);
        }
      })
    );

    // Manually graded assessments should not be auto-published
    // Check and ensure that isManuallyGraded = true and isGradingAutoPublished = true cannot be set simultaneously
    const setIsManuallyGraded = (index: number, value: boolean) => {
      setConfigs(prev => {
        const newConfigs = cloneDeep(prev) ?? [];
        newConfigs[index].isManuallyGraded = value;

        if (value) {
          newConfigs[index].isGradingAutoPublished = false;
          gridApi.current
            ?.getDisplayedRowAtIndex(index)
            ?.setDataValue('isGradingAutoPublished', false);
        }
        gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isManuallyGraded', value);
        return newConfigs;
      });
    };

    const setIsGradingAutoPublished = (index: number, value: boolean) => {
      setConfigs(prev => {
        const newConfigs = cloneDeep(prev) ?? [];
        newConfigs[index].isGradingAutoPublished = value;

        if (value) {
          newConfigs[index].isManuallyGraded = false;
          gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isManuallyGraded', false);
        }
        gridApi.current
          ?.getDisplayedRowAtIndex(index)
          ?.setDataValue('isGradingAutoPublished', value);
        return newConfigs;
      });
    };

    const valueSetter = useCallback(
      <T extends keyof AssessmentConfiguration>(field: T) =>
        (index: number, value: AssessmentConfiguration[T]) => {
          setConfigs(prev => {
            const newConfigs = cloneDeep(prev) ?? [];
            newConfigs[index][field] = value;
            gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue(field, value);
            return newConfigs;
          });
        },
      []
    );

    /* eslint-disable react-hooks/exhaustive-deps */
    const setDisplayInDashboard = useCallback(valueSetter('displayInDashboard'), []);
    const setHasTokenCounter = useCallback(valueSetter('hasTokenCounter'), []);
    const setHasVotingFeatures = useCallback(valueSetter('hasVotingFeatures'), []);
    const setEarlyXp = useCallback(valueSetter('earlySubmissionXp'), []);
    const setHoursBeforeDecay = useCallback(valueSetter('hoursBeforeEarlyXpDecay'), []);
    /* eslint-enable */

    const addRowHandler = useCallback(() => {
      if (configs.length >= 8) {
        showWarningMessage('You can have at most 8 assessment types!');
        return;
      }
      // Make sure to spread defaultAssessmentConfig twice
      // so that the (mutable) UI copy is not the same as the
      // (immutable) data copy.
      setConfigs(prev => [...prev, { ...defaultAssessmentConfig }]);
      gridApi.current?.applyTransaction({ add: [{ ...defaultAssessmentConfig }] });
    }, [configs.length]);

    const deleteRowHandler = useCallback(
      (index: number) => {
        if (configs.length <= 1) {
          showWarningMessage('You must have at least 1 assessment type!');
          return;
        }
        setConfigs(prev => {
          const newConfigs = cloneDeep(prev) ?? [];
          newConfigs.splice(index, 1);
          return newConfigs;
        });
        const rowToRemove = gridApi.current?.getDisplayedRowAtIndex(index)?.data;
        gridApi.current?.applyTransaction({ remove: [rowToRemove!] });
      },
      [configs.length]
    );

    const columnDefs: ColDef<AssessmentConfiguration>[] = useMemo(
      () => [
        {
          headerName: 'Assessment Type',
          field: 'type',
          rowDrag: true,
          editable: true
        },
        {
          headerName: 'Is Manually Graded',
          field: 'isManuallyGraded',
          cellRenderer: BooleanCell,
          cellRendererParams: {
            setStateHandler: setIsManuallyGraded,
            field: 'isManuallyGraded'
          }
        },
        {
          headerName: 'Is Auto-published',
          field: 'isGradingAutoPublished',
          cellRenderer: BooleanCell,
          cellRendererParams: {
            setStateHandler: setIsGradingAutoPublished,
            field: 'isGradingAutoPublished'
          }
        },
        {
          headerName: 'Display in Dashboard',
          field: 'displayInDashboard',
          cellRenderer: BooleanCell,
          cellRendererParams: {
            setStateHandler: setDisplayInDashboard,
            field: 'displayInDashboard'
          }
        },
        {
          headerName: 'Voting Features*',
          field: 'hasVotingFeatures',
          cellRenderer: BooleanCell,
          cellRendererParams: {
            setStateHandler: setHasVotingFeatures,
            field: 'hasVotingFeatures'
          }
        },
        {
          headerName: 'Token Counter*',
          field: 'hasTokenCounter',
          cellRenderer: BooleanCell,
          cellRendererParams: {
            setStateHandler: setHasTokenCounter,
            field: 'hasTokenCounter'
          }
        },
        {
          headerName: 'Max Bonus XP',
          field: 'earlySubmissionXp',
          cellRenderer: NumericCell,
          cellRendererParams: {
            setStateHandler: setEarlyXp,
            field: 'earlySubmissionXp'
          }
        },
        {
          headerName: 'Early Hours Before Decay',
          field: 'hoursBeforeEarlyXpDecay',
          cellRenderer: NumericCell,
          cellRendererParams: {
            setStateHandler: setHoursBeforeDecay,
            field: 'hoursBeforeEarlyXpDecay'
          }
        },
        {
          headerName: 'Delete',
          field: 'placeholderToPreventColumnRerender' as any,
          cellRenderer: DeleteRowCell,
          cellRendererParams: {
            deleteRowHandler: deleteRowHandler
          },
          resizable: false,
          flex: 2
        }
      ],
      [
        deleteRowHandler,
        setDisplayInDashboard,
        setEarlyXp,
        setHasTokenCounter,
        setHasVotingFeatures,
        setHoursBeforeDecay
      ]
    );

    // Tracks the movement of rows in our local React state while dragging
    const onRowDragMove = useCallback(
      (event: RowDragEvent) => {
        const movingNode = event.node;
        const overNode = event.overNode;
        const rowNeedsToMove = movingNode !== overNode;
        if (rowNeedsToMove) {
          const movingData = movingNode.data;
          const overData = overNode?.data;
          const fromIndex = indexOfObject(configs, movingData);
          const toIndex = indexOfObject(configs, overData);

          const temp = [...configs];
          moveInArray(temp, fromIndex, toIndex);
          setConfigs(temp);
        }
      },
      [configs]
    );

    // Updates the data passed into ag-grid
    // (this is necessary to update the rowIndex in our custom cellRenderer)
    const onRowDragLeaveOrEnd = (event: RowDragEvent) => {
      // gridApi.current?.setRowData(assessmentConfig.current);
    };

    // Updates our local React state whenever there are changes
    // to the Assessment Type column.
    const onCellValueChanged = (event: CellValueChangedEvent) => {
      if (event.colDef.field !== 'type') {
        return;
      }
      setConfigs(prev => {
        const newConfigs = cloneDeep(prev) ?? [];
        newConfigs[event.rowIndex!].type = event.value;
        return newConfigs;
      });
    };

    const onGridReady = (params: GridReadyEvent) => {
      gridApi.current = params.api;
    };

    const grid = (
      <div className="Grid ag-grid-parent ag-theme-balham">
        <AgGridReact
          domLayout="autoHeight"
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDefs}
          onGridReady={onGridReady}
          rowData={tableState.current}
          rowHeight={36}
          rowDragManaged={true}
          suppressCellFocus={true}
          suppressMovableColumns={true}
          suppressPaginationPanel={true}
          onRowDragMove={onRowDragMove}
          onRowDragLeave={onRowDragLeaveOrEnd}
          onRowDragEnd={onRowDragLeaveOrEnd}
          onCellValueChanged={onCellValueChanged}
        />
        <div className="footer-text">
          *If you create an assessment with these toggles enabled, they will be activated within the
          assessment <b>by default</b>. However, you can also visit ground control to manually
          override these settings if needed.
        </div>
      </div>
    );

    return (
      <div className="assessment-configuration">
        <div className="assessment-configuration-header-container">
          <H2>Assessment Configuration</H2>
          <Button text="Add Row" onClick={addRowHandler} className="add-row-button" />
        </div>
        {grid}
      </div>
    );
  }
);

function moveInArray(arr: any[], fromIndex: number, toIndex: number): void {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function indexOfObject(arr: any[], obj: any): number {
  for (let i = 0; i < arr.length; i++) {
    if (isEqual(arr[i], obj)) {
      return i;
    }
  }
  return -1;
}

export default AssessmentConfigPanel;
