import { Button, H2 } from '@blueprintjs/core';
import {
  type CellValueChangedEvent,
  type ColDef,
  type GetRowIdParams,
  type RowDragEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { themeSource } from 'src/commons/agGrid/theme';
import type { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import type { KeysOfType } from 'src/commons/utils/TypeHelper';

import BooleanCell from './BooleanCell';
import DeleteRowCell from './DeleteRowCell';
import NumericCell from './NumericCell';

const MAX_ROWS = 8;
const MIN_ROWS = 1;

// Negative ids mark rows that have not yet been persisted; the backend treats
// `assessmentConfigId: <negative>` as "create" (see the course-creation flow in
// BackendSaga) and assigns real ids on the next fetchAssessmentConfigs round
// trip. We use a per-mount monotonic counter so that multiple newly-added rows
// in the same session get unique `getRowId`s.
const defaultAssessmentConfig = (seqRef: { current: number }): AssessmentConfiguration => {
  seqRef.current += 1;
  return {
    assessmentConfigId: -(Date.now() + seqRef.current),
    type: 'untitled',
    isManuallyGraded: true,
    isGradingAutoPublished: false,
    displayInDashboard: true,
    isMinigame: false,
    hoursBeforeEarlyXpDecay: 0,
    hasTokenCounter: false,
    hasVotingFeatures: false,
    earlySubmissionXp: 0,
    isAutosaveEnabled: true,
  };
};

type Props = {
  configs: AssessmentConfiguration[];
  onChange: (next: AssessmentConfiguration[]) => void;
  onHasChangesChange: (val: boolean) => void;
  initialConfigs: AssessmentConfiguration[];
};

const defaultColumnDefs: ColDef = {
  flex: 3,
  minWidth: 70,
  filter: false,
  resizable: true,
  sortable: false,
};

function AssessmentConfigPanel({ configs, onChange, onHasChangesChange, initialConfigs }: Props) {
  // Per-mount counter for generating unique transient ids for brand-new rows.
  const newRowSeq = useRef(0);

  // Identify rows by their (eventual) assessmentConfigId. Transient new rows
  // get a unique negative id (see `defaultAssessmentConfig`) so ag-grid can
  // track them across reorders until the backend assigns real ids.
  const getRowId = useCallback(
    (params: GetRowIdParams<AssessmentConfiguration>) => String(params.data.assessmentConfigId),
    [],
  );

  // Single updater for every column. Immutably replaces the row, so ag-grid
  // re-renders from the new rowData with no manual API calls needed.
  const updateRow = useCallback(
    (id: number, partial: Partial<AssessmentConfiguration>) => {
      onChange(configs.map(row => (row.assessmentConfigId === id ? { ...row, ...partial } : row)));
    },
    [configs, onChange],
  );

  // isManuallyGraded and isGradingAutoPublished are mutually exclusive.
  const handleManuallyGradedChange = useCallback(
    (
      row: AssessmentConfiguration,
      field: KeysOfType<AssessmentConfiguration, boolean>,
      value: boolean,
    ) => {
      updateRow(row.assessmentConfigId, {
        isManuallyGraded: value,
        isGradingAutoPublished: value ? false : row.isGradingAutoPublished,
      });
    },
    [updateRow],
  );

  const handleAutoPublishedChange = useCallback(
    (
      row: AssessmentConfiguration,
      field: KeysOfType<AssessmentConfiguration, boolean>,
      value: boolean,
    ) => {
      updateRow(row.assessmentConfigId, {
        isGradingAutoPublished: value,
        isManuallyGraded: value ? false : row.isManuallyGraded,
      });
    },
    [updateRow],
  );

  // Generic field handler for non-mutually-exclusive columns. The cell passes
  // (row, field, value); we route it through updateRow keyed by id.
  const updateBooleanField = useCallback(
    (
      row: AssessmentConfiguration,
      field: KeysOfType<AssessmentConfiguration, boolean>,
      value: boolean,
    ) => {
      updateRow(row.assessmentConfigId, { [field]: value } as Partial<AssessmentConfiguration>);
    },
    [updateRow],
  );

  const updateNumericField = useCallback(
    (
      row: AssessmentConfiguration,
      field: KeysOfType<AssessmentConfiguration, number>,
      value: number,
    ) => {
      updateRow(row.assessmentConfigId, { [field]: value } as Partial<AssessmentConfiguration>);
    },
    [updateRow],
  );

  const handleAddRow = useCallback(() => {
    if (configs.length >= MAX_ROWS) {
      showWarningMessage(`You can have at most ${MAX_ROWS} assessment types!`);
      return;
    }
    onChange([...configs, defaultAssessmentConfig(newRowSeq)]);
  }, [configs, onChange, newRowSeq]);

  const handleRemoveRow = useCallback(
    (row: AssessmentConfiguration) => {
      if (configs.length <= MIN_ROWS) {
        showWarningMessage(`You must have at least ${MIN_ROWS} assessment type!`);
        return;
      }
      onChange(configs.filter(r => r.assessmentConfigId !== row.assessmentConfigId));
    },
    [configs, onChange],
  );

  // Diff the current configs against the last-known saved snapshot to drive
  // the "Save" button's enabled state. Replaces the old tableState ref.
  useEffect(() => {
    const sameLength = configs.length === initialConfigs.length;
    const sameContent = sameLength && configs.every((row, i) => isEqual(row, initialConfigs[i]));
    onHasChangesChange(!sameContent);
  }, [configs, initialConfigs, onHasChangesChange]);

  const columnDefs: ColDef<AssessmentConfiguration>[] = useMemo(
    () => [
      {
        headerName: 'Assessment Type',
        field: 'type',
        rowDrag: true,
        editable: true,
      },
      {
        headerName: 'Is Manually Graded',
        field: 'isManuallyGraded',
        cellRenderer: BooleanCell,
        cellRendererParams: {
          onChange: handleManuallyGradedChange,
          field: 'isManuallyGraded',
        },
      },
      {
        headerName: 'Is Auto-published',
        field: 'isGradingAutoPublished',
        cellRenderer: BooleanCell,
        cellRendererParams: {
          onChange: handleAutoPublishedChange,
          field: 'isGradingAutoPublished',
        },
      },
      {
        headerName: 'Display in Dashboard',
        field: 'displayInDashboard',
        cellRenderer: BooleanCell,
        cellRendererParams: {
          onChange: updateBooleanField,
          field: 'displayInDashboard',
        },
      },
      {
        headerName: 'Is Minigame',
        field: 'isMinigame',
        cellRenderer: BooleanCell,
        cellRendererParams: {
          onChange: updateBooleanField,
          field: 'isMinigame',
        },
      },
      {
        headerName: 'Voting Features*',
        field: 'hasVotingFeatures',
        cellRenderer: BooleanCell,
        cellRendererParams: {
          onChange: updateBooleanField,
          field: 'hasVotingFeatures',
        },
      },
      {
        headerName: 'Token Counter*',
        field: 'hasTokenCounter',
        cellRenderer: BooleanCell,
        cellRendererParams: {
          onChange: updateBooleanField,
          field: 'hasTokenCounter',
        },
      },
      {
        headerName: 'Autosave',
        field: 'isAutosaveEnabled',
        cellRenderer: BooleanCell,
        cellRendererParams: {
          onChange: updateBooleanField,
          field: 'isAutosaveEnabled',
        },
      },
      {
        headerName: 'Max Bonus XP',
        field: 'earlySubmissionXp',
        cellRenderer: NumericCell,
        cellRendererParams: {
          onChange: updateNumericField,
          field: 'earlySubmissionXp',
        },
      },
      {
        headerName: 'Early Hours Before Decay',
        field: 'hoursBeforeEarlyXpDecay',
        cellRenderer: NumericCell,
        cellRendererParams: {
          onChange: updateNumericField,
          field: 'hoursBeforeEarlyXpDecay',
        },
      },
      {
        headerName: 'Delete',
        field: 'actions' as any,
        cellRenderer: DeleteRowCell,
        cellRendererParams: {
          onRemove: handleRemoveRow,
        },
        resizable: false,
        flex: 2,
      },
    ],
    [
      handleAutoPublishedChange,
      handleManuallyGradedChange,
      handleRemoveRow,
      updateBooleanField,
      updateNumericField,
    ],
  );

  // Live-reorder rows while the user drags them. ag-grid's `rowDragManaged`
  // will pick up the new array ordering on the next render.
  const onRowDragMove = useCallback(
    (event: RowDragEvent<AssessmentConfiguration>) => {
      const movingNode = event.node;
      const overNode = event.overNode;
      if (!overNode || movingNode === overNode) {
        return;
      }
      // Prefer the event's overIndex when available (ag-grid v35 exposes it).
      const overIndex = typeof event.overIndex === 'number' ? event.overIndex! : overNode.rowIndex;
      const fromIndex = movingNode.rowIndex;
      if (fromIndex == null || overIndex == null || fromIndex === overIndex) {
        return;
      }
      const next = [...configs];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(overIndex, 0, moved);
      onChange(next);
    },
    [configs, onChange],
  );

  // Only the editable `type` column needs this; everything else is dispatched
  // directly by its cell renderer through `updateRow`.
  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent<AssessmentConfiguration>) => {
      if (event.colDef.field !== 'type' || event.data == null) {
        return;
      }
      updateRow(event.data.assessmentConfigId, { type: event.newValue });
    },
    [updateRow],
  );

  return (
    <div className="assessment-configuration">
      <div className="assessment-configuration-header-container">
        <H2>Assessment Configuration</H2>
        <Button text="Add Row" onClick={handleAddRow} className="add-row-button" />
      </div>
      <AgGridReact
        theme={themeSource}
        domLayout="autoHeight"
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        getRowId={getRowId}
        rowData={configs}
        rowHeight={36}
        suppressCellFocus
        suppressMovableColumns
        suppressPaginationPanel
        onRowDragMove={onRowDragMove}
        onCellValueChanged={onCellValueChanged}
      />
      <div className="footer-text">
        *If you create an assessment with these toggles enabled, they will be activated within the
        assessment <b>by default</b>. However, you can also visit ground control to manually
        override these settings if needed.
      </div>
    </div>
  );
}

export default AssessmentConfigPanel;
