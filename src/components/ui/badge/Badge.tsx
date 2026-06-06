import classNames from 'classnames';

const BADGE_SIZE_CLASS_NAMES = {
  xs: 'px-2.5 py-1 text-[0.7rem]',
  sm: 'px-[0.8rem] py-[0.4rem] text-[0.8rem]',
  md: 'px-4 py-2 text-[0.9rem]',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-xl',
} as const;

const BADGE_COLOR_CLASS_NAMES = {
  indigo: 'bg-indigo-400/25! text-indigo-600',
  emerald: 'bg-emerald-300/25! text-emerald-600',
  sky: 'bg-sky-300/25! text-sky-600',
  green: 'bg-green-400/25! text-green-700',
  yellow: 'bg-yellow-300/25! text-yellow-600',
  red: 'bg-red-400/25! text-red-700',
  gray: 'bg-gray-400/25! text-gray-700',
  purple: 'bg-purple-400/25! text-purple-700',
  blue: 'bg-blue-300/25! text-blue-600',
} as const;

export type BadgeSize = keyof typeof BADGE_SIZE_CLASS_NAMES;

export type BadgeColor = keyof typeof BADGE_COLOR_CLASS_NAMES;

type Props = {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
};

function Badge({ children, color, size = 'sm', icon, className, textClassName }: Props) {
  return (
    <span
      className={classNames(
        'mx-auto flex w-fit max-w-full flex-row items-center justify-center gap-1.5 rounded-full whitespace-nowrap leading-normal!',
        'hover:brightness-75',
        BADGE_SIZE_CLASS_NAMES[size],
        color ? BADGE_COLOR_CLASS_NAMES[color] : 'text-black/70',
        className,
      )}
    >
      {icon && <span className="flex shrink-0 items-center leading-none">{icon}</span>}
      <span className={classNames('min-w-0 max-w-full truncate leading-normal!', textClassName)}>
        {children}
      </span>
    </span>
  );
}

export default Badge;
