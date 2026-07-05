import classNames from 'classnames';

type Props = {
  children: React.ReactNode;
  className?: string;
};

function PageWrapper({ children, className }: Props) {
  return <div className={classNames('mt-5 mb-5 text-center w-full', className)}>{children}</div>;
}

export default PageWrapper;
