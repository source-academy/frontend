import { showSimpleConfirmDialog, SimpleConfirmDialogProps } from '../utils/DialogHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';

const DISCLAIMER_DIALOG_PROPS: SimpleConfirmDialogProps = {
  icon: 'warning-sign',
  title: 'You are switching to a unsafe feature!',
  contents: (
    <p>
      <code>full JavaScript</code> allows you to run arbitrary JS code beyond source.
      <br />
      <br />
      This might pose a security concern if you are not careful and fully aware of what program you
      are running!
      <br />
      <br />
      <strong>Do you still want to proceed?</strong>
    </p>
  ),
  positiveIntent: 'danger',
  positiveLabel: 'Proceed',
  negativeLabel: 'Cancel'
};

const URL_LOAD_INFO: string =
  'For security concerns, users are not allowed to load full JavaScript code from shared links';

export function showFullJSDisclaimer(): Promise<boolean> {
  return showSimpleConfirmDialog(DISCLAIMER_DIALOG_PROPS);
}

export function showFullJSWarningOnUrlLoad(): void {
  showWarningMessage(URL_LOAD_INFO);
}
