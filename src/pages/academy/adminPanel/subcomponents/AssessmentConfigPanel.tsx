import { H2 } from '@blueprintjs/core';
import { GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import * as React from 'react';
import { AssessmentConfiguration, AssessmentType } from 'src/commons/assessment/AssessmentTypes';

import UpdateRow from './UpdateRow';

export type AssessmentConfigPanelProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleUpdateAssessmentConfig: (assessmentConfiguration: AssessmentConfiguration) => void;
  handleUpdateAssessmentTypes: (assessmentTypes: AssessmentType[]) => void;
};

export type StateProps = {
  assessmentTypes: AssessmentType[];
};

export type ConfigRow = {
  order: number;
  type: AssessmentType;
  isGraded: boolean;
  hoursBeforeEarlyXpDecay: number;
  earlySubmissionXp: number;
  decayRatePointsPerHour: number;
};

const AssessmentConfigPanel: React.FC<AssessmentConfigPanelProps> = props => {
  const mockdata = [
    {
      type: 'Mission',
      order: 1,
      isGraded: true,
      earlySubmissionXp: 200,
      hoursBeforeEarlyXpDecay: 24,
      decayRatePointsPerHour: 2
    },
    {
      type: 'Path',
      order: 1,
      isGraded: true,
      earlySubmissionXp: 200,
      hoursBeforeEarlyXpDecay: 24,
      decayRatePointsPerHour: 2
    },
    {
      type: 'Quest',
      order: 1,
      isGraded: true,
      earlySubmissionXp: 200,
      hoursBeforeEarlyXpDecay: 24,
      decayRatePointsPerHour: 2
    }
  ];
  // const [assessmentConfig, setAssessmentConfig] = React.useState<ConfigRow[]>(mockdata);

  const columnDefs = [
    {
      headerName: 'Assessment Type',
      field: 'type',
      rowDrag: true
    },
    {
      headerName: 'Graded?',
      field: 'isGraded'
    },
    {
      headerName: 'Max Bonus XP',
      field: 'earlySubmissionXp'
    },
    {
      headerName: 'Early Hours Before Decay',
      field: 'hoursBeforeEarlyXpDecay'
    },
    {
      headerName: 'Decay Rate Per Hour',
      field: 'decayRatePointsPerHour'
    },
    {
      headerName: 'Save',
      field: '',
      cellRendererFramework: UpdateRow,
      cellRendererParams: {
        handleUpdateAssessmentConfig: props.handleUpdateAssessmentConfig
      },
      editable: false,
      width: 100
    }
  ];

  const defaultColumnDefs = {
    editable: true,
    filter: false,
    resizable: true,
    sortable: false
  };

  const onGridReady = (params: GridReadyEvent) => {
    const gridApi = params.api;
    gridApi.sizeColumnsToFit();
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        rowData={mockdata}
        rowHeight={36}
        rowDragManaged={true}
        suppressCellSelection={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      />
    </div>
  );
  return (
    <div className="assessment-configuration">
      <H2>Assessment Configuration</H2>
      {props.assessmentTypes}
      {grid}
    </div>
  );
};

export default AssessmentConfigPanel;
