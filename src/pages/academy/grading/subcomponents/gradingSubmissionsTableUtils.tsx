import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
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

  // Cell content is vertically centred via a forced flex-column: ag-grid cells are `inline-block`
  // by default and its CSS is injected unlayered (so it beats layered Tailwind utilities), hence the
  // `flex!` important modifier. Click behaviour comes from the grid's `onCellClicked`; text selection
  // from the grid's `enableCellTextSelection`. No custom cell wrappers are needed.
  const generalColProperties = {
    suppressMovable: true,
    cellClass: 'flex! flex-col justify-center cursor-pointer',
    headerClass: '[&_.ag-header-cell-text]:text-left',
    flex: 1, // weight of column width
  } satisfies ColDef<IGradingTableRow>;

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.assessmentName,
    field: ColumnFields.assessmentName,
    flex: 3,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.assessmentType,
    field: ColumnFields.assessmentType,
    headerClass: '[&_.ag-header-cell-text]:text-center',
    cellRenderer: (params: ICellRendererParams<IGradingTableRow>) =>
      params.data ? <AssessmentTypeBadge type={params.data.assessmentType} /> : null,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.studentName,
    field: ColumnFields.studentName,
    filter: true,
    flex: 1.5,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.studentUsername,
    field: ColumnFields.studentUsername,
    filter: true,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.groupName,
    field: ColumnFields.groupName,
    filter: true,
    flex: 0.75,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.progressStatus,
    field: ColumnFields.progressStatus,
    headerClass: '[&_.ag-header-cell-text]:text-center',
    cellRenderer: (params: ICellRendererParams<IGradingTableRow>) =>
      params.data ? <ProgressStatusBadge progress={params.data.progressStatus} /> : null,
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.xp,
    field: ColumnFields.xp,
    cellClass: classNames(
      'flex! flex-col justify-center whitespace-normal',
      filterMode ? 'cursor-text' : 'cursor-pointer',
    ),
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.actionsIndex,
    field: ColumnFields.actionsIndex,
    flex: 1.4,
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
