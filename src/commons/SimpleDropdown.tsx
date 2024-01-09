import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

type OptionType = { value: any; label: string };
type Props<T extends OptionType> = {
  options: T[];
  selectedValue?: T['value'];
  onClick?: (v: T['value']) => void;
  buttonProps?: Partial<React.ComponentProps<typeof Button> & { 'data-testid': string }>;
  popoverProps?: Partial<React.ComponentProps<typeof Popover2>>;
};

function SimpleDropdown<T extends OptionType>(props: Props<T>) {
  const { options, selectedValue, onClick, buttonProps, popoverProps } = props;

  const handleClick = (value: T['value']) => {
    onClick?.(value);
  };

  const buttonLabel = () => {
    const option = options.find(({ value }) => value === selectedValue);
    return option?.label;
  };

  return (
    <Popover2
      {...popoverProps}
      interactionKind="click"
      content={
        <Menu>
          {options.map(({ value, label }) => (
            <MenuItem key={label} text={label} onClick={() => handleClick(value)} />
          ))}
        </Menu>
      }
    >
      <Button {...buttonProps}>{buttonLabel()}</Button>
    </Popover2>
  );
}

export default SimpleDropdown;
