import { ColDef, ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { ColumnFields, ColumnName, IGradingTableRow } from 'src/features/grading/GradingTypes';
import classes from 'src/styles/Grading.module.scss';

import GradingActions from './GradingActions';
import { AssessmentTypeBadge, ProgressStatusBadge } from './GradingBadges';
import GradingFilterable from './GradingFilterable';

/**
 * Initialises the columns (and headers). The rows with data are added in the useEffect with ignored dependencies.
 */
export const generateCols = (filterMode: boolean) => {
  const cols: ColDef<IGradingTableRow>[] = [];

  const generalColProperties = {
    suppressMovable: true,
    cellClass: classNames(classes['grading-def-cell'], classes['grading-def-cell-pointer']),
    headerClass: classes['grading-default-headers'],
    flex: 1 // weight of column width
  } satisfies ColDef<IGradingTableRow>;

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.assessmentName,
    field: ColumnFields.assessmentName,
    flex: 3,
    cellClass: classNames(generalColProperties.cellClass, classes['grading-cell-align-left']),
    headerClass: classNames(generalColProperties.headerClass, classes['grading-left-align']),
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingFilterable,
            params: {
              value: params.data.assessmentName,
              filterMode: filterMode
            }
          }
        : undefined;
    }
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.assessmentType,
    field: ColumnFields.assessmentType,
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingFilterable,
            params: {
              value: params.data.assessmentType,
              children: [<AssessmentTypeBadge type={params.data.assessmentType} />],
              filterMode: filterMode
            }
          }
        : undefined;
    }
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.studentName,
    field: ColumnFields.studentName,
    filter: true,
    flex: 1.5,
    cellClass: classNames(generalColProperties.cellClass, classes['grading-cell-align-left']),
    headerClass: classNames(generalColProperties.headerClass, classes['grading-left-align']),
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingFilterable,
            params: {
              value: params.data.studentName,
              filterMode: filterMode
            }
          }
        : undefined;
    }
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.studentUsername,
    field: ColumnFields.studentUsername,
    filter: true,
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingFilterable,
            params: {
              value: params.data.studentUsername,
              filterMode: filterMode
            }
          }
        : undefined;
    }
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.groupName,
    field: ColumnFields.groupName,
    filter: true,
    flex: 0.75,
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingFilterable,
            params: {
              value: params.data.groupName,
              filterMode: filterMode
            }
          }
        : undefined;
    }
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.progressStatus,
    field: ColumnFields.progressStatus,
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingFilterable,
            params: {
              value: params.data.progressStatus,
              children: [<ProgressStatusBadge progress={params.data.progressStatus} />],
              filterMode: filterMode
            }
          }
        : undefined;
    }
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.xp,
    field: ColumnFields.xp,
    cellClass: classNames(
      generalColProperties.cellClass,
      classes['grading-xp-cell'],
      !filterMode ? classes['grading-def-cell-pointer'] : classes['grading-def-cell-selectable']
    )
  });

  cols.push({
    ...generalColProperties,
    headerName: ColumnName.actionsIndex,
    field: ColumnFields.actionsIndex,
    flex: 1.4,
    headerClass: classNames(generalColProperties.headerClass, classes['grading-left-align']),
    cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
      return params.data !== undefined
        ? {
            component: GradingActions,
            params: {
              submissionId: params.data.actionsIndex,
              progress: params.data.progressStatus,
              filterMode: filterMode
            }
          }
        : undefined;
    }
  });

  return cols;
};
