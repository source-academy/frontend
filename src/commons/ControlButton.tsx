import { AnchorButton, Button, Icon, type IconName, Intent } from '@blueprintjs/core';

type ButtonOptions = {
  className: string;
  fullWidth: boolean;
  iconColor?: string;
  iconOnRight: boolean;
  intent: Intent;
  variant: 'minimal' | 'outlined' | 'solid' | 'default';
  type?: 'submit' | 'reset' | 'button';
};

const defaultOptions = {
  className: '',
  fullWidth: false,
  iconOnRight: false,
  intent: Intent.NONE,
  variant: 'minimal',
} as const;

type Props = {
  label?: string;
  icon?: IconName;
  onClick?: () => void;
  options?: Partial<ButtonOptions>;
  isDisabled?: boolean;
};

const ControlButton: React.FC<Props> = ({
  label = '',
  icon,
  onClick,
  options = {},
  isDisabled = false,
}) => {
  const buttonOptions: ButtonOptions = { ...defaultOptions, ...options };
  const iconElement = icon && <Icon icon={icon} color={buttonOptions.iconColor} />;
  // Refer to #2417 and #2422 for why we conditionally
  // set the button component. See also:
  // https://blueprintjs.com/docs/#core/components/button
  const ButtonComponent = isDisabled ? AnchorButton : Button;

  return (
    <ButtonComponent
      disabled={isDisabled}
      fill={buttonOptions.fullWidth}
      intent={buttonOptions.intent}
      variant={buttonOptions.variant === 'default' ? undefined : buttonOptions.variant}
      className={buttonOptions.className}
      type={buttonOptions.type}
      onClick={onClick}
      icon={!buttonOptions.iconOnRight && iconElement}
      endIcon={buttonOptions.iconOnRight && iconElement}
    >
      {label}
    </ButtonComponent>
  );
};

export default ControlButton;
