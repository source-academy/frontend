import { Intent, Position, Toaster } from '@blueprintjs/core';

const notification = Toaster.create({
  position: Position.TOP
});

export const showSuccessMessage = (message: string | JSX.Element, timeout: number = 2000) => {
  notification.show({
    intent: Intent.SUCCESS,
    message,
    timeout
  });
};

export const showWarningMessage = (message: string | JSX.Element, timeout: number = 2000) => {
  notification.show({
    intent: Intent.WARNING,
    message,
    timeout
  });
};
