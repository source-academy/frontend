import {
  Button,
  ButtonProps,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  IconName,
  Intent
} from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import classes from 'src/styles/ConfirmDialog.module.scss';

export interface ConfirmDialogProps<T> {
  icon?: IconName;
  title?: string;
  contents?: React.ReactNode;
  choices: Array<{ key: T; label: string; intent?: Intent; props?: ButtonProps }>;
  largeButtons?: boolean;
  escapeResponse?: T;
  onResponse: (response: T) => void;
  isOpen?: boolean;
  props?: Omit<DialogProps, 'isOpen'>;
}

export function ConfirmDialog<T>(
  props: ConfirmDialogProps<T>
): React.ReactElement<ConfirmDialogProps<T>> {
  const buttons = props.choices.map((choice, i) => (
    <Button
      key={i}
      onClick={() => props.onResponse && props.onResponse(choice.key)}
      intent={choice.intent}
      fill={props.largeButtons}
      className={classNames(props.largeButtons && classes['large-button'])}
      {...choice.props}
    >
      {choice.label}
    </Button>
  ));
  const { escapeResponse } = props;
  const escapeHandler =
    typeof escapeResponse === 'undefined'
      ? undefined
      : () => props.onResponse && props.onResponse(escapeResponse);
  return (
    <Dialog
      className={classNames(Classes.DARK, classes['ConfirmDialog'])}
      title={props.title}
      isCloseButtonShown={typeof props.title === 'undefined' ? undefined : false}
      canEscapeKeyClose={!!escapeHandler}
      onClose={escapeHandler}
      isOpen={props.isOpen}
      icon={props.icon}
      {...props.props}
    >
      <DialogBody>{props.contents}</DialogBody>
      <DialogFooter actions={!props.largeButtons && <>{buttons}</>}>
        {props.largeButtons && buttons}
      </DialogFooter>
    </Dialog>
  );
}
