import { Alert, H2, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
// import { cloneDeep } from 'lodash';
import * as React from 'react';
import { AssessmentConfiguration, AssessmentType } from 'src/commons/assessment/AssessmentTypes';
import controlButton from 'src/commons/ControlButton';

export type AssessmentConfigPanelProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchAssessmentConfigs: () => void;
  handleUpdateAssessmentConfigs: (assessmentConfigs: AssessmentConfiguration[]) => void;
};

export type StateProps = {
  assessmentTypes: AssessmentType[];
  assessmentConfigurations?: AssessmentConfiguration[];
};

const AssessmentConfigPanel: React.FC<AssessmentConfigPanelProps> = props => {
  const [assessmentConfig, setAssessmentConfig] = React.useState<AssessmentConfiguration[]>([]);
  const [gridApi, setGridApi] = React.useState<GridApi>();
  const [alertOpen, setAlertOpen] = React.useState(false);

  React.useEffect(() => {
    if (props.assessmentConfigurations) {
      setAssessmentConfig(props.assessmentConfigurations);
    } else {
      console.log('undefined');
    }
  }, [props.assessmentConfigurations]);

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
    }
  ];

  const defaultColumnDefs = {
    editable: true,
    filter: false,
    resizable: true,
    sortable: false
  };

  const fetchAndRefresh = () => {
    props.handleFetchAssessmentConfigs();
    const params = {
      force: true,
      suppressFlash: false
    };
    if (gridApi) {
      gridApi.sizeColumnsToFit();
      gridApi.refreshCells(params);
    }
  };

  const saveChanges = () => {
    let newData: AssessmentConfiguration[] = [];
    for (let i = 0; i < assessmentConfig.length; i++) {
      const node = gridApi!.getRowNode(i + '');
      newData = newData.concat([node!.data]);
    }
    setAssessmentConfig(newData);
    // gridApi!.forEachNode((node, i) => {
    // 	const old = cloneDeep(assessmentConfig);
    // 	setAssessmentConfig(old.concat([node.data]));
    // 	console.log(i);
    // 	console.log(old);
    // });
  };

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        rowData={assessmentConfig}
        // rowData={props.assessmentConfigurations!}
        rowHeight={36}
        rowDragManaged={true}
        suppressCellSelection={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
        enableCellChangeFlash={true}
      />
    </div>
  );

  const handleOpenAlert = () => {
    saveChanges();
    setAlertOpen(true);
  };
  const handleCloseAlert = () => setAlertOpen(false);

  const updateAssessmentConfig = () => {
    saveChanges();
    props.handleUpdateAssessmentConfigs(assessmentConfig);
    handleCloseAlert();
  };

  return (
    <div className="assessment-configuration">
      <H2>Assessment Configuration</H2>
      {controlButton('Refresh', IconNames.REFRESH, fetchAndRefresh)}
      {controlButton('Save', IconNames.FLOPPY_DISK, handleOpenAlert)}
      {/* {assessmentConfig} */}
      {grid}
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Confirm"
        icon="warning-sign"
        intent={Intent.WARNING}
        isOpen={alertOpen}
        onCancel={handleCloseAlert}
        onConfirm={updateAssessmentConfig}
      >
        <p>Are you sure you want to save the Assessment Configuration to the backend?</p>
      </Alert>
    </div>
  );
};

export default AssessmentConfigPanel;
