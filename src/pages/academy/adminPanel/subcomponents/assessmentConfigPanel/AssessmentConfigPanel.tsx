import { Button, H2 } from '@blueprintjs/core';
import { CellValueChangedEvent, GridApi, GridReadyEvent, RowDragEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { isEqual } from 'lodash';
import React from 'react';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';

import { AssessmentConfiguration } from '../../../../../commons/assessment/AssessmentTypes';
import BooleanCell, { AssessmentConfigBooleanField } from './BooleanCell';
import DeleteRowCell from './DeleteRowCell';
import NumericCell, { AssessmentConfigNumericField } from './NumericCell';

export type AssessmentConfigPanelProps = OwnProps;

type OwnProps = {
  assessmentConfig: React.MutableRefObject<AssessmentConfiguration[]>;
  setAssessmentConfig: (assessmentConfig: AssessmentConfiguration[]) => void;
  setAssessmentConfigsToDelete: (assessmentConfig: AssessmentConfiguration) => void;
  setHasChangesAssessmentConfig: (val: boolean) => void;
};

const AssessmentConfigPanel: React.FC<AssessmentConfigPanelProps> = props => {
  const { assessmentConfig, setAssessmentConfig, setAssessmentConfigsToDelete } = props;
  const gridApi = React.useRef<GridApi>();

  const setIsManuallyGraded = (index: number, value: boolean) => {
    const temp = [...assessmentConfig.current];
    temp[index] = {
      ...temp[index],
      isManuallyGraded: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isManuallyGraded', value);
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
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 0,
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

  const columnDefs = [
    {
      headerName: 'Assessment Type',
      field: 'type',
      rowDrag: true,
      editable: true
    },
    {
      headerName: 'Is Manually Graded',
      field: 'isManuallyGraded',
      cellRendererFramework: BooleanCell,
      cellRendererParams: {
        setStateHandler: setIsManuallyGraded,
        field: AssessmentConfigBooleanField.IS_MANUALLY_GRADED
      }
    },
    {
      headerName: 'Display in Dashboard',
      field: 'displayInDashboard',
      cellRendererFramework: BooleanCell,
      cellRendererParams: {
        setStateHandler: setDisplayInDashboard,
        field: AssessmentConfigBooleanField.DISPLAY_IN_DASHBOARD
      }
    },
    {
      headerName: 'Max Bonus XP',
      field: 'earlySubmissionXp',
      cellRendererFramework: NumericCell,
      cellRendererParams: {
        setStateHandler: setEarlyXp,
        field: AssessmentConfigNumericField.EARLY_XP
      }
    },
    {
      headerName: 'Early Hours Before Decay',
      field: 'hoursBeforeEarlyXpDecay',
      cellRendererFramework: NumericCell,
      cellRendererParams: {
        setStateHandler: setHoursBeforeDecay,
        field: AssessmentConfigNumericField.HOURS_BEFORE_DECAY
      }
    },
    {
      headerName: 'Delete Row',
      field: 'placeholderToPreventColumnRerender',
      cellRendererFramework: DeleteRowCell,
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
        const overData = overNode.data;
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
  // cellRendererFramework)
  const onRowDragLeaveOrEnd = (event: RowDragEvent) => {
    gridApi.current?.setRowData(assessmentConfig.current);
    props.setHasChangesAssessmentConfig(true);
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
      props.setHasChangesAssessmentConfig(true);
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
        rowData={props.assessmentConfig.current}
        rowHeight={36}
        rowDragManaged={true}
        suppressCellSelection={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
        onRowDragMove={onRowDragMove}
        onRowDragLeave={onRowDragLeaveOrEnd}
        onRowDragEnd={onRowDragLeaveOrEnd}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );

  return (
    <div className="assessment-configuration">
      <H2>Assessment Configuration</H2>
      {grid}
      <Button text="Add Row" onClick={addRowHandler} className="add-row-button" />
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
