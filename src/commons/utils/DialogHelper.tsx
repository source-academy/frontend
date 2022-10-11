import { IconName, Intent } from '@blueprintjs/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ConfirmDialog, ConfirmDialogProps } from '../dialogs/ConfirmDialog';
import { PromptDialog, PromptDialogProps } from '../dialogs/PromptDialog';

// The below is based off the Blueprint Toaster:
// https://github.com/palantir/blueprint/blob/develop/packages/core/src/components/toast/toaster.tsx

interface DialogHelperState {
  dialog: ReturnType<typeof React.createElement> | null;
  dialogOnClose: (() => void) | null;
}

class DialogHelper extends React.PureComponent<{}, DialogHelperState> {
  public state: DialogHelperState = {
    dialog: null,
    dialogOnClose: null
  };

  public static create(): DialogHelper {
    const containerElement = document.createElement('div');
    document.body.appendChild(containerElement);
    const dialogHelper = ReactDOM.render<{}>(<DialogHelper />, containerElement) as DialogHelper;
    if (dialogHelper == null) {
      throw new Error('Could not create DialogHelper - are you in a React lifecycle method?');
    }
    return dialogHelper;
  }

  public show(dialog: DialogHelperState['dialog'], onClose?: () => void) {
    this.setState(() => ({ dialog, dialogOnClose: onClose || null }));
  }

  public close() {
    if (this.state.dialogOnClose) {
      this.state.dialogOnClose();
    }
    this.setState(() => ({ dialog: null, dialogOnClose: null }));
  }

  public render() {
    return this.state.dialog;
  }
}

const singleton = DialogHelper.create();

export function showDialog(dialog: DialogHelperState['dialog'], dialogOnClose?: () => void) {
  singleton.show(dialog, dialogOnClose);
}

export function closeDialog() {
  singleton.close();
}

export function promisifyDialog<P, R>(
  DialogComponent: React.ComponentType<P>,
  propFn: (resolve: (response: R) => void) => P
): Promise<R> {
  return new Promise<R>((resolve, reject) => {
    showDialog(<DialogComponent {...propFn(resolve)} />, reject);
  }).finally(closeDialog);
}

export function showConfirmDialog<T>(
  props: Omit<ConfirmDialogProps<T>, 'onResponse'> &
    Partial<Pick<ConfirmDialogProps<T>, 'onResponse'>>
): Promise<T> {
  return promisifyDialog<ConfirmDialogProps<T>, T>(ConfirmDialog, resolve => ({
    ...props,
    onResponse: resolve,
    isOpen: true
  }));
}

export interface SimpleConfirmDialogProps {
  icon?: IconName;
  title?: string;
  contents?: React.ReactNode;
  positiveLabel?: string;
  positiveIntent?: Intent;
  negativeLabel?: string;
  props?: Partial<ConfirmDialogProps<boolean>>;
}

export function showSimpleConfirmDialog(props: SimpleConfirmDialogProps): Promise<boolean> {
  return showConfirmDialog<boolean>({
    title: props.title,
    contents: props.contents,
    choices: [
      { key: false, label: props.negativeLabel || 'No' },
      {
        key: true,
        label: props.positiveLabel || 'Yes',
        intent: props.positiveIntent || Intent.SUCCESS,
        props: { type: 'submit' }
      }
    ],
    escapeResponse: false,
    icon: props.icon,
    ...props.props
  });
}

export interface SimpleErrorDialogProps {
  title?: string;
  contents?: React.ReactNode;
  label?: string;
  props?: Partial<ConfirmDialogProps<boolean>>;
}

export function showSimpleErrorDialog(props: SimpleErrorDialogProps): Promise<boolean> {
  return showConfirmDialog<boolean>({
    title: props.title,
    contents: props.contents,
    choices: [
      {
        key: true,
        label: props.label || 'OK',
        intent: Intent.PRIMARY,
        props: { type: 'submit' }
      }
    ],
    escapeResponse: false,
    icon: 'error',
    ...props.props
  });
}

export function showSimplePromptDialog(props: {
  title?: string;
  contents?: React.ReactNode;
  positiveLabel?: string;
  negativeLabel?: string;
  props?: Partial<PromptDialogProps<boolean>>;
}) {
  return promisifyDialog<PromptDialogProps<boolean>, { buttonResponse: boolean; value: string }>(
    PromptDialog,
    resolve => ({
      title: props.title,
      contents: props.contents,
      choices: [
        { key: false, label: props.negativeLabel || 'Cancel' },
        {
          key: true,
          label: props.positiveLabel || 'Accept',
          intent: Intent.SUCCESS,
          disableOnInvalid: true
        }
      ],
      escapeResponse: false,
      enterResponse: true,
      onResponse: (buttonResponse, value) => resolve({ buttonResponse, value }),
      isOpen: true,
      ...props.props
    })
  );
}
