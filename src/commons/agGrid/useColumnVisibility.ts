import type { GridApi } from 'ag-grid-community';
import { useCallback, useEffect, useRef, useState } from 'react';

export type UseColumnVisibilityOptions = {
  /** Maps a column id to the label shown on its "hidden" chip. Defaults to the id itself. */
  getColumnLabel?: (colId: string) => string;
  /** Columns hidden on first mount. */
  initialHidden?: string[];
};

export type ColumnVisibilityHeaderProps = {
  /** Spread into `defaultColDef.headerComponentParams` to enable the generic header's eye-off icon. */
  onHide: (colId: string) => void;
};

export type ColumnVisibilityChipsProps = {
  hiddenColumns: string[];
  getColumnLabel: (colId: string) => string;
  onShow: (colId: string) => void;
};

export type UseColumnVisibilityResult = {
  hiddenColumns: string[];
  hideColumn: (colId: string) => void;
  showColumn: (colId: string) => void;
  /** Wire into {@link AgGridTable}'s `onReady`. */
  onReady: (api: GridApi) => void;
  /** Wire into the grid's `onFirstDataRendered` (re-applies once columns exist). */
  onFirstDataRendered: () => void;
  /** Spread into `defaultColDef.headerComponentParams`. */
  headerProps: ColumnVisibilityHeaderProps;
  /** Spread into `<HiddenColumnsBar />`. */
  chipsProps: ColumnVisibilityChipsProps;
};

const identity = (colId: string) => colId;

/**
 * Headless controller for opt-in ag-grid column hiding. Owns the hidden-column
 * set as local state and is the single place that calls `GridApi.setColumnsVisible`,
 * via one idempotent diff-based effect. Compose with the generic `ColumnHeader`
 * (renders the per-column eye-off icon) and `HiddenColumnsBar` (renders the
 * removable chips).
 */
export function useColumnVisibility(
  options: UseColumnVisibilityOptions = {},
): UseColumnVisibilityResult {
  const { getColumnLabel = identity, initialHidden = [] } = options;

  const [hiddenColumns, setHiddenColumns] = useState<string[]>(initialHidden);
  const apiRef = useRef<GridApi | null>(null);
  const prevHiddenRef = useRef<string[]>(initialHidden);

  const hideColumn = useCallback((colId: string) => {
    setHiddenColumns(prev => (prev.includes(colId) ? prev : [...prev, colId]));
  }, []);

  const showColumn = useCallback((colId: string) => {
    setHiddenColumns(prev => prev.filter(id => id !== colId));
  }, []);

  const applyVisibility = useCallback((toHide: string[], toShow: string[]) => {
    const api = apiRef.current;
    if (!api) {
      return; // api not ready yet; onReady re-applies the full hidden set once it is
    }
    if (toHide.length > 0) {
      api.setColumnsVisible(toHide, false);
    }
    if (toShow.length > 0) {
      api.setColumnsVisible(toShow, true);
    }
  }, []);

  // Single source of truth for grid mutations: diff the previous vs current hidden
  // set. Both mutators only touch state, collapsing the old add=hide / remove=show
  // asymmetry into this one idempotent effect.
  useEffect(() => {
    const prev = prevHiddenRef.current;
    prevHiddenRef.current = hiddenColumns;
    applyVisibility(
      hiddenColumns.filter(id => !prev.includes(id)),
      prev.filter(id => !hiddenColumns.includes(id)),
    );
  }, [hiddenColumns, applyVisibility]);

  const reapplyAll = useCallback(() => {
    applyVisibility(hiddenColumns, []);
  }, [applyVisibility, hiddenColumns]);

  const onReady = useCallback(
    (api: GridApi) => {
      apiRef.current = api;
      applyVisibility(hiddenColumns, []); // re-hide the whole set against the freshly-live api
    },
    [applyVisibility, hiddenColumns],
  );

  return {
    hiddenColumns,
    hideColumn,
    showColumn,
    onReady,
    onFirstDataRendered: reapplyAll,
    headerProps: { onHide: hideColumn },
    chipsProps: { hiddenColumns, getColumnLabel, onShow: showColumn },
  };
}
