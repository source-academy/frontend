import {
  Button,
  Collapse,
  Divider,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ColDef, type GridApi, type GridReadyEvent, themeBalham } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useMemo, useRef, useState } from 'react';
import { useAppDispatch, useSession } from 'src/commons/utils/Hooks';

import SessionActions from '../../../commons/application/actions/SessionActions';
import type { AssessmentOverview } from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import GroundControlActions from '../../../features/groundControl/GroundControlActions';
import DefaultChapterSelect from '../../../pages/academy/groundControl/subcomponents/DefaultChapterSelect';
import ConfigureCell from '../../../pages/academy/groundControl/subcomponents/GroundControlConfigureCell';
import DeleteCell from '../../../pages/academy/groundControl/subcomponents/GroundControlDeleteCell';
import Dropzone from '../../../pages/academy/groundControl/subcomponents/GroundControlDropzone';
import EditCell from '../../../pages/academy/groundControl/subcomponents/GroundControlEditCell';
import EditTeamSizeCell from '../../../pages/academy/groundControl/subcomponents/GroundControlEditTeamSizeCell';
import PublishCell from '../../../pages/academy/groundControl/subcomponents/GroundControlPublishCell';
import ReleaseGradingCell from '../../../pages/academy/groundControl/subcomponents/GroundControlReleaseGradingCell';

const defaultColumnDefs: ColDef = {
  flex: 2,
  minWidth: 70,
  filter: true,
  resizable: true,
  sortable: true,
};

function GroundControl() {
  const [showDropzone, setShowDropzone] = useState(false);
  const { assessmentOverviews, assessmentConfigurations } = useSession();
  const dispatch = useAppDispatch();

  const gridApi = useRef<GridApi | null>(null);

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    params.api.sizeColumnsToFit();

    // Sort assessments by opening date, breaking ties by later of closing dates
    params.api.applyColumnState({
      state: [
        { colId: 'openAt', sort: 'desc' },
        { colId: 'closeAt', sort: 'desc' },
      ],
    });
  };

  const columnDefs = useMemo<ColDef<AssessmentOverview>[]>(
    () => [
      { field: 'number', headerName: 'ID', flex: 1 },
      { headerName: 'Title', field: 'title' },
      { headerName: 'Category', field: 'type' },
      {
        headerName: 'Open Date',
        field: 'openAt',
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: dateFilterComparator,
          inRangeInclusive: true,
        },
        sortingOrder: ['desc', 'asc', null],
        cellRenderer: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) =>
            dispatch(GroundControlActions.changeDateAssessment(id, openAt, closeAt)),
          forOpenDate: true,
        },
        flex: 3,
      },
      {
        headerName: 'Close Date',
        field: 'closeAt',
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: dateFilterComparator,
          inRangeInclusive: true,
        },
        sortingOrder: ['desc', 'asc', null],
        cellRenderer: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) =>
            dispatch(GroundControlActions.changeDateAssessment(id, openAt, closeAt)),
          forOpenDate: false,
        },
        flex: 3,
      },
      {
        headerName: 'Max Team Size',
        field: 'maxTeamSize',
        cellRenderer: EditTeamSizeCell,
        cellRendererParams: {
          onTeamSizeChange: (id: number, maxTeamSize: number) =>
            dispatch(GroundControlActions.changeTeamSizeAssessment(id, maxTeamSize)),
        },
      },
      {
        headerName: 'Published',
        field: 'placeholderPublish' as any,
        cellRenderer: PublishCell,
        cellRendererParams: {
          handlePublishAssessment: (togglePublishAssessmentTo: boolean, id: number) =>
            dispatch(GroundControlActions.publishAssessment(togglePublishAssessmentTo, id)),
        },
        filter: false,
        resizable: false,
        sortable: false,
        cellStyle: { padding: 0 },
      },
      {
        headerName: 'Grading',
        field: 'placeholderReleaseGrading' as any,
        cellRenderer: ReleaseGradingCell,
        cellRendererParams: {
          handlePublishGradingAll: (id: number) =>
            dispatch(GroundControlActions.publishGradingAll(id)),
          handleUnpublishGradingAll: (id: number) =>
            dispatch(GroundControlActions.unpublishGradingAll(id)),
        },
        filter: false,
        resizable: false,
        sortable: false,
        cellStyle: { padding: 0 },
      },
      {
        headerName: 'Actions',
        field: 'placeholderDelete' as any,
        cellRenderer: ({ data }: { data: AssessmentOverview }) => {
          return (
            <>
              <DeleteCell
                data={data}
                handleDeleteAssessment={(id: number) =>
                  dispatch(GroundControlActions.deleteAssessment(id))
                }
              />
              <ConfigureCell
                data={data}
                handleConfigureAssessment={(
                  id: number,
                  hasVotingFeatures: boolean,
                  hasTokenCounter: boolean,
                  isAutosaveEnabled: boolean,
                ) =>
                  dispatch(
                    GroundControlActions.configureAssessment(
                      id,
                      hasVotingFeatures,
                      hasTokenCounter,
                      isAutosaveEnabled,
                    ),
                  )
                }
                handleAssignEntriesForVoting={(id: number) =>
                  dispatch(GroundControlActions.assignEntriesForVoting(id))
                }
              />
            </>
          );
        },
        filter: false,
        resizable: false,
        sortable: false,
        cellStyle: { padding: 0 },
      },
    ],
    [dispatch],
  );

  const controls = (
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
      <Button
        icon={IconNames.REFRESH}
        onClick={() => dispatch(SessionActions.fetchAssessmentOverviews())}
      >
        <span className="hidden-xs">Refresh assessments</span>
      </Button>
    </div>
  );

  const dropzone = (
    <Collapse isOpen={showDropzone} keepChildrenMounted>
      <Dropzone
        handleUploadAssessment={(file: File, forceUpdate: boolean, assessmentConfigId: number) =>
          dispatch(GroundControlActions.uploadAssessment(file, forceUpdate, assessmentConfigId))
        }
        assessmentConfigurations={assessmentConfigurations}
      />
    </Collapse>
  );

  const grid = (
    <div className="Grid">
      <AgGridReact
        theme={themeBalham}
        alwaysShowHorizontalScroll
        domLayout="autoHeight"
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        rowData={assessmentOverviews}
        rowHeight={35}
        suppressCellFocus
        suppressMovableColumns
        suppressPaginationPanel
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
    dispatch(SessionActions.fetchAssessmentOverviews());
    dispatch(SessionActions.fetchCourseConfig());
  };

  return (
    <div>
      <ContentDisplay display={content} loadContentDispatch={loadContent} />
    </div>
  );
}

/*
 *  Reference: https://www.ag-grid.com/javascript-grid-filter-date/#date-filter-comparator
 */
const dateFilterComparator = (filterDate: Date, cellValue: string) => {
  const cellDate = new Date(cellValue);
  return cellDate < filterDate ? -1 : cellDate > filterDate ? 1 : 0;
};

export const Component = GroundControl;
