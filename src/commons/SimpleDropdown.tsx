import { Button, Menu, MenuItem, Popover } from '@blueprintjs/core';

type OptionType = { value: any; label: string };
type Props<T extends OptionType> = {
  options: T[];
  selectedValue?: T['value'];
  onClick?: (v: T['value']) => void;
  buttonProps?: Partial<React.ComponentProps<typeof Button> & { 'data-testid': string }>;
  popoverProps?: Partial<React.ComponentProps<typeof Popover>>;
};

const SimpleDropdown = <T extends OptionType>({
  options,
  selectedValue,
  onClick,
  buttonProps,
  popoverProps
}: Props<T>) => {
  const handleClick = (value: T['value']) => {
    onClick?.(value);
  };

  const buttonLabel = () => {
    const option = options.find(({ value }) => value === selectedValue);
    return option?.label;
  };

  return (
    <Popover
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
    </Popover>
  );
};

export default SimpleDropdown;
