import classNames from 'classnames';

type Props = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

function FormField({ label, htmlFor, children, className }: Props) {
  return (
    <div className={classNames('w-75 mb-5 mr-20', className)}>
      <label htmlFor={htmlFor} className="block text-base mb-3.75">
        {label}
      </label>
      {children}
    </div>
  );
}

export default FormField;
