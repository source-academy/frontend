import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import type { IGradingTableRow } from 'src/features/grading/GradingTypes';
import { ColumnFields, ColumnName } from 'src/features/grading/GradingTypes';

import GradingActions from './GradingActions';
import AssessmentTypeBadge from './gradingBadges/AssessmentTypeBadge';
import ProgressStatusBadge from './gradingBadges/ProgressStatusBadge';

/**
 * Initialises the columns (and headers). The rows with data are added in the useEffect with ignored dependencies.
 */
export const generateCols = (filterMode: boolean) => {
  const cols: ColDef<IGradingTableRow>[] = [];

  // Click behaviour comes from the grid's `onCellClicked`; text selection from `enableCellTextSelection`.
  const generalColProperties = {
    suppressMovable: true,
    flex: 1, // weight of column width
  } satisfies ColDef<IGradingTableRow>;

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.assessmentName,
    field: ColumnFields.assessmentName,
    cellClass: 'text-left',
    flex: 3,
    minWidth: 160,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.assessmentType,
    field: ColumnFields.assessmentType,
    minWidth: 100,
    cellClass: 'flex! flex-col justify-center',
    cellRenderer: (params: ICellRendererParams<IGradingTableRow>) =>
      params.data ? <AssessmentTypeBadge type={params.data.assessmentType} /> : null,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.studentName,
    field: ColumnFields.studentName,
    cellClass: 'text-left',
    filter: true,
    flex: 1.5,
    minWidth: 140,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.studentUsername,
    field: ColumnFields.studentUsername,
    minWidth: 120,
    filter: true,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.groupName,
    field: ColumnFields.groupName,
    filter: true,
    flex: 0.75,
    minWidth: 90,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.progressStatus,
    field: ColumnFields.progressStatus,
    minWidth: 115,
    cellClass: 'flex! flex-col justify-center',
    cellRenderer: (params: ICellRendererParams<IGradingTableRow>) =>
      params.data ? <ProgressStatusBadge progress={params.data.progressStatus} /> : null,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.xp,
    field: ColumnFields.xp,
    minWidth: 120,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.actionsIndex,
    field: ColumnFields.actionsIndex,
    flex: 1.4,
    minWidth: 130,
    cellClass: 'flex! flex-col justify-center',
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingActions,
            params: {
              submissionId: params.data.actionsIndex,
              progress: params.data.progressStatus,
              filterMode: filterMode,
            },
          }
        : undefined;
    },
  });

  return cols;
};
