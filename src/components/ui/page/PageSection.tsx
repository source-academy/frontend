import classNames from 'classnames';

type Props = {
  children?: React.ReactNode;
  className?: string;
};

function PageSection({ children, className = '' }: Props) {
  return (
    <div className={classNames('flex min-h-dvh bg-gray-900 text-white', className)}>{children}</div>
  );
}

export default PageSection;
