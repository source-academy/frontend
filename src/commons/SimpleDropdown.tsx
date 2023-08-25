import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';

type OptionType = { value: any; label: string };
type Props<T extends OptionType> = {
  options: T[];
  defaultValue?: T['value'];
  onClick?: (v: T['value']) => void;
  buttonProps?: Partial<React.ComponentProps<typeof Button>>;
  popoverProps?: Partial<React.ComponentProps<typeof Popover2>>;
};

function SimpleDropdown<T extends OptionType>(props: Props<T>) {
  const { options, defaultValue, onClick, buttonProps, popoverProps } = props;
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  const handleClick = (value: T['value']) => {
    setSelectedOption(value);
    onClick?.(value);
  };

  const buttonLabel = () => {
    const option = options.find(({ value }) => value === selectedOption);
    return option?.label;
  };

  return (
    <Popover2
      {...popoverProps}
      interactionKind="click"
      content={
        <Menu>
          {options.map(({ value, label }) => (
            <MenuItem text={label} onClick={() => handleClick(value)} />
          ))}
        </Menu>
      }
    >
      <Button {...buttonProps}>{buttonLabel()}</Button>
    </Popover2>
  );
}

export default SimpleDropdown;
