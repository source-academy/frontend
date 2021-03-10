import { Intent, IToastProps, Position, Toaster } from '@blueprintjs/core';

const notification = Toaster.create({
  position: Position.TOP
});

export const showSuccessMessage = (
  message: string | JSX.Element,
  timeout: number = 2000,
  key?: string
) =>
  notification.show(
    {
      intent: Intent.SUCCESS,
      message,
      timeout
    },
    key
  );

export const showWarningMessage = (
  message: string | JSX.Element,
  timeout: number = 2000,
  key?: string
) =>
  notification.show(
    {
      intent: Intent.WARNING,
      message,
      timeout
    },
    key
  );

export const showDangerMessage = (
  message: string | JSX.Element,
  timeout: number = 2000,
  key?: string
) =>
  notification.show(
    {
      intent: Intent.DANGER,
      message,
      timeout
    },
    key
  );

export const showMessage = (props: IToastProps, key?: string) => notification.show(props, key);

export const dismiss = (key: string) => notification.dismiss(key);
