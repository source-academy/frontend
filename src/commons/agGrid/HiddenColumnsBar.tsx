import classNames from 'classnames';
import type { BadgeColor } from 'src/components/ui/badge';
import { DismissibleBadge } from 'src/components/ui/badge';

export type HiddenColumnsBarProps = {
  hiddenColumns: string[];
  onShow: (colId: string) => void;
  getColumnLabel?: (colId: string) => string;
  getBadgeColor?: (colId: string) => BadgeColor;
  /** Optional leading label, e.g. a "Columns Hidden:" element. */
  label?: React.ReactNode;
  className?: string;
};

const identity = (colId: string) => colId;

/**
 * Renders the hidden columns as removable chips above a grid. Pairs with
 * {@link useColumnVisibility} — spread its `chipsProps`. Renders nothing when no
 * columns are hidden.
 */
function HiddenColumnsBar({
  hiddenColumns,
  onShow,
  getColumnLabel = identity,
  getBadgeColor,
  label,
  className,
}: HiddenColumnsBarProps) {
  if (hiddenColumns.length === 0) {
    return null;
  }

  return (
    <div className={classNames('flex items-center', className)}>
      {label}
      {hiddenColumns.map(colId => {
        const columnLabel = getColumnLabel(colId);
        return (
          <DismissibleBadge
            key={colId}
            color={getBadgeColor?.(colId)}
            className="ml-1.25"
            ariaLabel={`Show ${columnLabel} column`}
            onDismiss={() => onShow(colId)}
          >
            {columnLabel}
          </DismissibleBadge>
        );
      })}
    </div>
  );
}

export default HiddenColumnsBar;
