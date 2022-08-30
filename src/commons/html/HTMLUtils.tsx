import { showSimpleConfirmDialog, SimpleConfirmDialogProps } from '../utils/DialogHelper';

const DISCLAIMER_DIALOG_PROPS: SimpleConfirmDialogProps = {
  icon: 'warning-sign',
  title: 'You are switching to an unsafe feature!',
  contents: (
    <p>
      <code>HTML</code> allows you to run arbitrary JS code beyond Source.
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

export function showHTMLDisclaimer(): Promise<boolean> {
  return showSimpleConfirmDialog(DISCLAIMER_DIALOG_PROPS);
}
