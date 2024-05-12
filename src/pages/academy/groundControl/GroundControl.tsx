import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import {
  Button,
  Collapse,
  Divider,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSession } from 'src/commons/utils/Hooks';

import SessionActions from '../../../commons/application/actions/SessionActions';
import { AssessmentOverview } from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import {
  assignEntriesForVoting,
  changeDateAssessment,
  changeTeamSizeAssessment,
  configureAssessment,
  deleteAssessment,
  publishAssessment,
  publishGradingAll,
  unpublishGradingAll,
  uploadAssessment
} from '../../../features/groundControl/GroundControlActions';
import DefaultChapterSelect from './subcomponents/DefaultChapterSelect';
import ConfigureCell from './subcomponents/GroundControlConfigureCell';
import DeleteCell from './subcomponents/GroundControlDeleteCell';
import Dropzone from './subcomponents/GroundControlDropzone';
import EditCell from './subcomponents/GroundControlEditCell';
import EditTeamSizeCell from './subcomponents/GroundControlEditTeamSizeCell';
import PublishCell from './subcomponents/GroundControlPublishCell';
import ReleaseGradingCell from './subcomponents/GroundControlReleaseGradingCell';

const GroundControl: React.FC = () => {
  const [showDropzone, setShowDropzone] = useState(false);
  const { assessmentOverviews, assessmentConfigurations } = useSession();

  const dispatch = useDispatch();
  const {
    handleAssessmentChangeDate,
    handleAssessmentChangeTeamSize,
    handleAssessmentOverviewFetch,
    handleAssignEntriesForVoting,
    handleConfigureAssessment,
    handleDeleteAssessment,
    handleFetchCourseConfigs,
    handlePublishAssessment,
    handlePublishGradingAll,
    handleUnpublishGradingAll,
    handleUploadAssessment
  } = useMemo(
    () => ({
      handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) =>
        dispatch(changeDateAssessment(id, openAt, closeAt)),
      handleAssessmentChangeTeamSize: (id: number, maxTeamSize: number) =>
        dispatch(changeTeamSizeAssessment(id, maxTeamSize)),
      handleAssessmentOverviewFetch: () => dispatch(SessionActions.fetchAssessmentOverviews()),
      handleAssignEntriesForVoting: (id: number) => dispatch(assignEntriesForVoting(id)),
      handleConfigureAssessment: (
        id: number,
        hasVotingFeatures: boolean,
        hasTokenCounter: boolean
      ) => dispatch(configureAssessment(id, hasVotingFeatures, hasTokenCounter)),
      handleDeleteAssessment: (id: number) => dispatch(deleteAssessment(id)),
      handleFetchCourseConfigs: () => dispatch(SessionActions.fetchCourseConfig()),
      handlePublishAssessment: (togglePublishTo: boolean, id: number) =>
        dispatch(publishAssessment(togglePublishTo, id)),
      handlePublishGradingAll: (id: number) => dispatch(publishGradingAll(id)),
      handleUnpublishGradingAll: (id: number) => dispatch(unpublishGradingAll(id)),
      handleUploadAssessment: (file: File, forceUpdate: boolean, assessmentConfigId: number) =>
        dispatch(uploadAssessment(file, forceUpdate, assessmentConfigId))
    }),
    [dispatch]
  );

  const gridApi = useRef<GridApi>();

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    params.api.sizeColumnsToFit();

    // Sort assessments by opening date, breaking ties by later of closing dates
    params.api.applyColumnState({
      state: [
        { colId: 'openAt', sort: 'desc' },
        { colId: 'closeAt', sort: 'desc' }
      ]
    });
  };

  const resizeGrid = () => {
    gridApi.current?.sizeColumnsToFit();
  };

  const columnDefs: ColDef<AssessmentOverview>[] = [
    {
      field: 'number',
      headerName: 'ID',
      width: 50
    },
    {
      headerName: 'Title',
      field: 'title'
    },
    {
      headerName: 'Category',
      field: 'type',
      width: 100
    },
    {
      headerName: 'Open Date',
      field: 'openAt',
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: dateFilterComparator,
        inRangeInclusive: true
      },
      sortingOrder: ['desc', 'asc', null],
      cellRenderer: EditCell,
      cellRendererParams: {
        handleAssessmentChangeDate: handleAssessmentChangeDate,
        forOpenDate: true
      },
      width: 150
    },
    {
      headerName: 'Close Date',
      field: 'closeAt',
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: dateFilterComparator,
        inRangeInclusive: true
      },
      sortingOrder: ['desc', 'asc', null],
      cellRenderer: EditCell,
      cellRendererParams: {
        handleAssessmentChangeDate: handleAssessmentChangeDate,
        forOpenDate: false
      },
      width: 150
    },
    {
      headerName: 'Max Team Size',
      field: 'maxTeamSize',
      cellRenderer: EditTeamSizeCell,
      cellRendererParams: {
        onTeamSizeChange: handleAssessmentChangeTeamSize
      },
      width: 100
    },
    {
      headerName: 'Publish',
      field: 'placeholderPublish' as any,
      cellRenderer: PublishCell,
      cellRendererParams: {
        handlePublishAssessment: handlePublishAssessment
      },
      width: 70,
      filter: false,
      resizable: false,
      sortable: false,
      cellStyle: {
        padding: 0
      }
    },
    {
      headerName: 'Release Grading',
      field: 'placeholderReleaseGrading' as any,
      cellRenderer: ReleaseGradingCell,
      cellRendererParams: {
        handlePublishGradingAll: handlePublishGradingAll,
        handleUnpublishGradingAll: handleUnpublishGradingAll
      },
      width: 120,
      filter: false,
      resizable: false,
      sortable: false,
      cellStyle: {
        padding: 0
      }
    },
    {
      headerName: 'Actions',
      field: 'placeholderActions' as any,
      cellRenderer: (data: AssessmentOverview) => {
        return (
          <>
            <DeleteCell handleDeleteAssessment={handleDeleteAssessment} data={data} />
            <ConfigureCell
              handleConfigureAssessment={handleConfigureAssessment}
              handleAssignEntriesForVoting={handleAssignEntriesForVoting}
              data={data}
            />
          </>
        );
      },
      width: 100,
      filter: false,
      resizable: false,
      sortable: false,
      cellStyle: {
        padding: 0
      }
    }
  ];

  const defaultColumnDefs = {
    filter: true,
    resizable: true,
    sortable: true
  };

  const controls = useMemo(
    () => (
      <div className="GridControls ground-control-controls">
        <Button
          active={showDropzone}
          icon={IconNames.CLOUD_UPLOAD}
          intent={showDropzone ? Intent.PRIMARY : Intent.NONE}
          onClick={() => setShowDropzone(prev => !prev)}
        >
          <span className="hidden-xs">Upload assessment</span>
        </Button>
        <DefaultChapterSelect />
        <Button icon={IconNames.REFRESH} onClick={handleAssessmentOverviewFetch}>
          <span className="hidden-xs">Refresh assessments</span>
        </Button>
      </div>
    ),
    [handleAssessmentOverviewFetch, showDropzone]
  );

  const dropzone = (
    <Collapse isOpen={showDropzone} keepChildrenMounted={true}>
      <Dropzone
        handleUploadAssessment={handleUploadAssessment}
        assessmentConfigurations={assessmentConfigurations}
      />
    </Collapse>
  );

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        alwaysShowHorizontalScroll={true}
        domLayout="autoHeight"
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        onGridSizeChanged={resizeGrid}
        rowData={assessmentOverviews}
        rowHeight={35}
        suppressCellFocus={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      />
    </div>
  );

  if (!assessmentOverviews) {
    return (
      <NonIdealState
        description="Fetching assessments..."
        icon={<Spinner size={SpinnerSize.LARGE} />}
      />
    );
  }

  const content = (
    <div className="GroundControl">
      {controls}
      {dropzone}
      <Divider />
      {grid}
    </div>
  );

  const loadContent = () => {
    // Always load AssessmentOverviews and CourseConfigs to get the latest values (just in case)
    handleAssessmentOverviewFetch();
    handleFetchCourseConfigs();
  };

  return (
    <div>
      <ContentDisplay display={content} loadContentDispatch={loadContent} />
    </div>
  );
};

/*
 *  Reference: https://www.ag-grid.com/javascript-grid-filter-date/#date-filter-comparator
 */
const dateFilterComparator = (filterDate: Date, cellValue: string) => {
  const cellDate = new Date(cellValue);
  return cellDate < filterDate ? -1 : cellDate > filterDate ? 1 : 0;
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = GroundControl;
Component.displayName = 'GroundControl';

export default GroundControl;
