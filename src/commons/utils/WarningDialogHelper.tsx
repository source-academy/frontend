import { showSimpleConfirmDialog, type SimpleConfirmDialogProps } from './DialogHelper';

// Full JS
const FULL_JS_DISCLAIMER_DIALOG_PROPS: SimpleConfirmDialogProps = {
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
  negativeLabel: 'Cancel',
};

export function showFullJSDisclaimer(): Promise<boolean> {
  return showSimpleConfirmDialog(FULL_JS_DISCLAIMER_DIALOG_PROPS);
}

// Full TS
const FULL_TS_DISCLAIMER_DIALOG_PROPS: SimpleConfirmDialogProps = {
  icon: 'warning-sign',
  title: 'You are switching to a unsafe feature!',
  contents: (
    <p>
      <code>full TypeScript</code> allows you to run arbitrary JS code beyond source.
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
  negativeLabel: 'Cancel',
};

export function showFullTSDisclaimer(): Promise<boolean> {
  return showSimpleConfirmDialog(FULL_TS_DISCLAIMER_DIALOG_PROPS);
}
