import { Button, Icon, IconName, Intent } from '@blueprintjs/core';

type ButtonOptions = {
  className: string;
  fullWidth: boolean;
  iconColor?: string;
  iconOnRight: boolean;
  intent: Intent;
  minimal: boolean;
  type?: 'submit' | 'reset' | 'button';
};

const defaultOptions = {
  className: '',
  fullWidth: false,
  iconOnRight: false,
  intent: Intent.NONE,
  minimal: true
};

const controlButton = (
  label: string,
  icon?: IconName,
  onClick?: () => void,
  options: Partial<ButtonOptions> = {},
  disabled: boolean = false
) => {
  const buttonOptions: ButtonOptions = { ...defaultOptions, ...options };
  const iconElement = icon && <Icon icon={icon} color={buttonOptions.iconColor} />;

  return (
    <Button
      disabled={disabled}
      fill={buttonOptions.fullWidth}
      intent={buttonOptions.intent}
      minimal={buttonOptions.minimal}
      className={buttonOptions.className}
      type={buttonOptions.type}
      onClick={onClick}
      icon={!buttonOptions.iconOnRight && iconElement}
      rightIcon={buttonOptions.iconOnRight && iconElement}
    >
      {label}
    </Button>
  );
};

export default controlButton;
