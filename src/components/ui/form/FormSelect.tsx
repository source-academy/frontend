import classNames from 'classnames';
import type { Props as SelectProps } from 'react-select';
import Select from 'react-select';

type Props = SelectProps & {
  className?: string;
};

function FormSelect({ className, ...props }: Props) {
  return (
    <div className={classNames('flex-1 w-full', className)}>
      <Select {...props} />
    </div>
  );
}

export default FormSelect;
