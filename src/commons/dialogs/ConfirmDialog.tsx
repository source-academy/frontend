import * as React from 'react';
import { Dialog, Classes, Button, IDialogProps, Intent, IButtonProps } from '@blueprintjs/core';
import classNames from 'classnames';

export interface ConfirmDialogProps<T> {
  title?: string;
  contents?: React.ReactNode;
  choices: Array<{ key: T; label: string; intent?: Intent; props?: IButtonProps }>;
  largeButtons?: boolean;
  escapeResponse?: T;
  onResponse: (response: T) => void;
  isOpen?: boolean;
  props?: IDialogProps;
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
      className={classNames(props.largeButtons && 'large-button')}
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
      className={classNames(Classes.DARK, 'ConfirmDialog')}
      title={props.title}
      isCloseButtonShown={typeof props.title === 'undefined' ? undefined : false}
      canEscapeKeyClose={!!escapeHandler}
      onClose={escapeHandler}
      isOpen={props.isOpen}
      {...props.props}
    >
      <div className={Classes.DIALOG_BODY}>{props.contents}</div>
      <div className={Classes.DIALOG_FOOTER}>
        {props.largeButtons && buttons}
        {!props.largeButtons && <div className={Classes.DIALOG_FOOTER_ACTIONS}>{buttons}</div>}
      </div>
    </Dialog>
  );
}
