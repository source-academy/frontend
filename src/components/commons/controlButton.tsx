import { Button, IButtonProps, IconName, Intent } from '@blueprintjs/core';
import * as React from 'react';

type controlButtonOptionals = {
  className?: string;
  fullWidth?: boolean;
  iconOnRight?: boolean;
  intent?: Intent;
  minimal?: boolean;
};

const defaultOptions = {
  className: '',
  fullWidth: false,
  iconOnRight: false,
  intent: Intent.NONE,
  minimal: true
};

export function controlButton(
  label: string,
  icon: IconName | null,
  onClick: (() => void) | null = null,
  options: controlButtonOptionals = {},
  disabled: boolean = false
) {
  const opts: controlButtonOptionals = { ...defaultOptions, ...options };
  const props: IButtonProps = { disabled };
  props.fill = opts.fullWidth !== undefined && opts.fullWidth;
  props.intent = opts.intent === undefined ? Intent.NONE : opts.intent;
  props.minimal = opts.minimal !== undefined && opts.minimal;
  props.className = opts.className;
  if (icon) {
    opts.iconOnRight ? (props.rightIcon = icon) : (props.icon = icon);
  }
  if (onClick) {
    props.onClick = onClick;
  }
  return <Button {...props}>{label}</Button>;
}
