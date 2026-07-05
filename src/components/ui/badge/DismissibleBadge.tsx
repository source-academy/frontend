import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';

import type { BadgeColor, BadgeSize } from './Badge';
import Badge from './Badge';

type Props = {
  children: React.ReactNode;
  onDismiss: () => void;
  ariaLabel?: string;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
  badgeClassName?: string;
  textClassName?: string;
};

function DismissibleBadge({
  children,
  onDismiss,
  ariaLabel,
  color,
  size,
  className,
  badgeClassName,
  textClassName,
}: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={classNames(
        'cursor-pointer rounded-full border-0 bg-transparent px-0.5 text-inherit outline-none transition hover:brightness-75 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        className,
      )}
      onClick={onDismiss}
    >
      <Badge
        color={color}
        size={size}
        icon={<Icon icon={IconNames.CROSS} />}
        className={badgeClassName}
        textClassName={textClassName}
      >
        {children}
      </Badge>
    </button>
  );
}

export default DismissibleBadge;
