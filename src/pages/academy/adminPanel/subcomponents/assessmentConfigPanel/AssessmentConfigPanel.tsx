import { Button, H2 } from '@blueprintjs/core';
import {
  CellValueChangedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  RowDragEvent
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { isEqual } from 'lodash';
import React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

import BooleanCell from './BooleanCell';
import DeleteRowCell from './DeleteRowCell';
import NumericCell from './NumericCell';

type Props = {
  assessmentConfig: React.MutableRefObject<AssessmentConfiguration[]>;
  setAssessmentConfig: (assessmentConfig: AssessmentConfiguration[]) => void;
  setAssessmentConfigsToDelete: (assessmentConfig: AssessmentConfiguration) => void;
  setHasChangesAssessmentConfig: (val: boolean) => void;
};

const AssessmentConfigPanel: React.FC<Props> = ({
  assessmentConfig,
  setAssessmentConfig,
  setAssessmentConfigsToDelete,
  setHasChangesAssessmentConfig
}) => {
  const gridApi = React.useRef<GridApi>();

  // manually graded assessments should not be auto-published
  // check and ensure that isManuallyGraded = true and isGradingAutoPublished = true cannot be set simultaneously
  const setIsManuallyGraded = (index: number, value: boolean) => {
    const temp = [...assessmentConfig.current];
    temp[index] = {
      ...temp[index],
      isManuallyGraded: value
    };

    // use a second spread operator if mutation of temp[index] causes issues
    if (value) {
      temp[index].isGradingAutoPublished = false;
      gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isGradingAutoPublished', false);
    }

    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isManuallyGraded', value);
  };

  const setIsGradingAutoPublished = (index: number, value: boolean) => {
    const temp = [...assessmentConfig.current];

    temp[index] = {
      ...temp[index],
      isGradingAutoPublished: value
    };

    if (value) {
      temp[index].isManuallyGraded = false;
      gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isManuallyGraded', false);
    }

    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isGradingAutoPublished', value);
  };

  const setDisplayInDashboard = (index: number, value: boolean) => {
    const temp = [...assessmentConfig.current];
    temp[index] = {
      ...temp[index],
      displayInDashboard: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('displayInDashboard', value);
  };

  const setHasTokenCounter = (index: number, value: boolean) => {
    const temp = [...assessmentConfig.current];
    temp[index] = {
      ...temp[index],
      hasTokenCounter: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('hasTokenCounter', value);
  };

  const setHasVotingFeatures = (index: number, value: boolean) => {
    const temp = [...assessmentConfig.current];
    temp[index] = {
      ...temp[index],
      hasVotingFeatures: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('hasVotingFeatures', value);
  };

  const setEarlyXp = (index: number, value: number) => {
    const temp = [...assessmentConfig.current];
    temp[index] = {
      ...temp[index],
      earlySubmissionXp: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('earlySubmissionXp', value);
  };

  const setHoursBeforeDecay = (index: number, value: number) => {
    const temp = [...assessmentConfig.current];
    temp[index] = {
      ...temp[index],
      hoursBeforeEarlyXpDecay: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('hoursBeforeEarlyXpDecay', value);
  };

  const addRowHandler = () => {
    if (assessmentConfig.current.length >= 8) {
      showWarningMessage('You can have at most 8 assessment types!');
      return;
    }

    const temp = [...assessmentConfig.current];
    temp.push({
      assessmentConfigId: -1,
      type: 'untitled',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 0,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 0
    });
    setAssessmentConfig(temp);
    gridApi.current?.setRowData(temp);
  };

  const deleteRowHandler = (index: number) => {
    if (assessmentConfig.current.length <= 1) {
      showWarningMessage('You must have at least 1 assessment type!');
      return;
    }

    const temp = [...assessmentConfig.current];
    const deleted = temp.splice(index, 1);
    gridApi.current?.setRowData(temp);
    setAssessmentConfig(temp);
    setAssessmentConfigsToDelete(deleted[0]);
  };

  const columnDefs: ColDef<AssessmentConfiguration>[] = [
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
      headerName: 'Delete Row',
      field: 'placeholderToPreventColumnRerender' as any,
      cellRenderer: DeleteRowCell,
      cellRendererParams: {
        deleteRowHandler: deleteRowHandler
      },
      maxWidth: 120,
      resizable: false
    }
  ];

  const defaultColumnDefs = {
    filter: false,
    resizable: true,
    sortable: false
  };

  // Tracks the movement of rows in our local React state while dragging
  const onRowDragMove = React.useCallback(
    (event: RowDragEvent) => {
      const movingNode = event.node;
      const overNode = event.overNode;
      const rowNeedsToMove = movingNode !== overNode;
      if (rowNeedsToMove) {
        const movingData = movingNode.data;
        const overData = overNode?.data;
        const fromIndex = indexOfObject(assessmentConfig.current, movingData);
        const toIndex = indexOfObject(assessmentConfig.current, overData);

        const temp = [...assessmentConfig.current];
        moveInArray(temp, fromIndex, toIndex);
        assessmentConfig.current = temp;
      }
    },
    [assessmentConfig]
  );

  // Updates the data passed into ag-grid (this is necessary to update the rowIndex in our custom
  // cellRenderer)
  const onRowDragLeaveOrEnd = (event: RowDragEvent) => {
    gridApi.current?.setRowData(assessmentConfig.current);
    setHasChangesAssessmentConfig(true);
  };

  // Updates our local React state whenever there are changes to the Assessment Type column
  const onCellValueChanged = (event: CellValueChangedEvent) => {
    if (event.colDef.field === 'type') {
      const temp = [...assessmentConfig.current];
      temp[event.rowIndex!] = {
        ...temp[event.rowIndex!],
        type: event.value
      };
      assessmentConfig.current = temp;
      setHasChangesAssessmentConfig(true);
    }
  };

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    params.api.sizeColumnsToFit();
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        onGridSizeChanged={() => gridApi.current?.sizeColumnsToFit()}
        rowData={assessmentConfig.current}
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
};

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
