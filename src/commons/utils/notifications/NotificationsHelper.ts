import { Intent, ToastProps } from '@blueprintjs/core';

import { notification } from './createNotification';

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

export const showMessage = (props: ToastProps, key?: string) => notification.show(props, key);

export const dismiss = (key: string) => notification.dismiss(key);
