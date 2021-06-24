import { H2 } from '@blueprintjs/core';
import { CellValueChangedEvent, GridApi, GridReadyEvent, RowDragEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { isEqual } from 'lodash';
import React from 'react';

import { AssessmentConfiguration } from '../../../../commons/assessment/AssessmentTypes';
import IsGradedCell from './IsGradedCell';
import NumericCell, { AssessmentConfigNumericField } from './NumericCell';

export type AssessmentConfigPanelProps = OwnProps;

type OwnProps = {
  assessmentConfigurations: AssessmentConfiguration[];
  setAssessmentConfigurations: (assessmentConfig: AssessmentConfiguration[]) => void;
};

const AssessmentConfigPanel: React.FC<AssessmentConfigPanelProps> = props => {
  const [assessmentConfig, setAssessmentConfig] = React.useState<AssessmentConfiguration[]>(
    props.assessmentConfigurations
  );
  const gridApi = React.useRef<GridApi>();

  /**
   * Although we are tracking the form in local React state, we do not pass this React state
   * as props into the ag-grid component as this would cause a flicker in ag-grid whenever this
   * state is updated. Instead, we use ag-grid's API to update the corresponding cell.
   */
  const setIsGraded = (index: number, value: boolean) => {
    const temp = [...assessmentConfig];
    temp[index] = {
      ...temp[index],
      isGraded: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isGraded', value);
  };

  const setEarlyXp = (index: number, value: number) => {
    const temp = [...assessmentConfig];
    temp[index] = {
      ...temp[index],
      earlySubmissionXp: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('earlySubmissionXp', value);
  };

  const setHoursBeforeDecay = (index: number, value: number) => {
    const temp = [...assessmentConfig];
    temp[index] = {
      ...temp[index],
      hoursBeforeEarlyXpDecay: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('hoursBeforeEarlyXpDecay', value);
  };

  const setDecayRate = (index: number, value: number) => {
    const temp = [...assessmentConfig];
    temp[index] = {
      ...temp[index],
      decayRatePointsPerHour: value
    };
    setAssessmentConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('decayRatePointsPerHour', value);
  };

  const columnDefs = [
    {
      headerName: 'Assessment Type',
      field: 'type',
      rowDrag: true,
      editable: true
    },
    {
      headerName: 'Graded?',
      field: 'isGraded',
      cellRendererFramework: IsGradedCell,
      cellRendererParams: {
        setIsGraded: setIsGraded
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
      headerName: 'Decay Rate Per Hour',
      field: 'decayRatePointsPerHour',
      cellRendererFramework: NumericCell,
      cellRendererParams: {
        setStateHandler: setDecayRate,
        field: AssessmentConfigNumericField.DECAY_RATE
      }
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
        const fromIndex = indexOfObject(assessmentConfig, movingData);
        const toIndex = indexOfObject(assessmentConfig, overData);

        const temp = [...assessmentConfig];
        moveInArray(temp, fromIndex, toIndex);
        setAssessmentConfig(temp);
      }
    },
    [assessmentConfig]
  );

  // Updates the data passed into ag-grid (this is necessary to update the rowIndex in our custom
  // cellRendererFramework)
  const onRowDragLeaveOrEnd = (event: RowDragEvent) => {
    gridApi.current?.setRowData(assessmentConfig);
  };

  // Updates our local React state whenever there are changes to the Assessment Type column
  const onCellValueChanged = (event: CellValueChangedEvent) => {
    if (event.colDef.field === 'type') {
      const temp = [...assessmentConfig];
      temp[event.rowIndex!] = {
        ...temp[event.rowIndex!],
        type: event.value
      };
      setAssessmentConfig(temp);
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
        rowData={props.assessmentConfigurations}
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
