import { Button, Icon, Tooltip } from '@blueprintjs/core';
import type { CustomHeaderProps } from 'ag-grid-react';

export type ColumnHeaderParams = {
  /** When provided, renders an eye-off icon that hides the column on click. */
  onHide?: (colId: string) => void;
  /** Column ids for which the hide icon is suppressed. */
  hideDisabledCols?: string[];
  /**
   * Consumer-injected header controls (e.g. a sort icon), rendered in the same
   * hover-revealed cluster, before the hide icon.
   */
  extraActions?: (props: CustomHeaderProps) => React.ReactNode;
};

type Props = CustomHeaderProps & ColumnHeaderParams;

/**
 * Generic ag-grid `agColumnHeader`. Renders the header label plus a
 * hover-revealed action cluster containing any consumer `extraActions` and an
 * opt-in eye-off (hide-column) button. Header text is left-aligned by default;
 * center a column via `headerClass: '[&_.ag-header-cell-text]:text-center!'` on its ColDef.
 */
function ColumnHeader(props: Props) {
  const { displayName, onHide, hideDisabledCols, extraActions } = props;
  const colId = props.column.getColId();
  const canHide = onHide !== undefined && !hideDisabledCols?.includes(colId);

  return (
    <div className="group relative flex h-full w-full items-center">
      <span className="ag-header-cell-text w-full truncate text-left">{displayName}</span>

      <div className="pointer-events-none absolute right-0 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        {extraActions?.(props)}
        {canHide && (
          <Tooltip content="Hide column" position="bottom">
            <Button
              variant="minimal"
              className="flex cursor-pointer rounded p-1.5 hover:bg-black/10"
              onClick={() => onHide(colId)}
            >
              <Icon icon="eye-off" />
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default ColumnHeader;
