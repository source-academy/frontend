import { showSimpleConfirmDialog, SimpleConfirmDialogProps } from '../utils/DialogHelper';

const DISCLAIMER_DIALOG_PROPS: SimpleConfirmDialogProps = {
  icon: 'warning-sign',
  title: 'Beware when running shared HTML code!',
  contents: (
    <p>
      You are about to access HTML code written by others, which may contain malicious scripts.
      <br />
      <br />
      This might pose a security concern if you are not careful and fully aware of what the shared
      HTML code contains!
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
