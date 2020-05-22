import { Button, IButtonProps, Icon, IconName, Intent } from '@blueprintjs/core';
import * as React from 'react';

type controlButtonOptionals = {
  className?: string;
  fullWidth?: boolean;
  iconColor?: string;
  iconOnRight?: boolean;
  intent?: Intent;
  minimal?: boolean;
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
  icon: IconName | null,
  onClick: (() => void) | null = null,
  options: controlButtonOptionals = {},
  disabled: boolean = false
) => {
  const opts: controlButtonOptionals = { ...defaultOptions, ...options };
  const props: IButtonProps = { disabled };

  props.fill = opts.fullWidth !== undefined && opts.fullWidth;
  props.intent = opts.intent === undefined ? Intent.NONE : opts.intent;
  props.minimal = opts.minimal !== undefined && opts.minimal;
  props.className = opts.className;
  props.type = opts.type;

  if (icon) {
    const ic: JSX.Element = (
      <Icon icon={icon} color={opts.iconColor ? opts.iconColor : undefined} />
    );
    opts.iconOnRight ? (props.rightIcon = ic) : (props.icon = ic);
  }

  if (onClick) {
    props.onClick = onClick;
  }

  return <Button {...props}>{label}</Button>;
};

export default controlButton;
