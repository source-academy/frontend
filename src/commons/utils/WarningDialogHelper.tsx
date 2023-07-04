import { showSimpleConfirmDialog, SimpleConfirmDialogProps } from './DialogHelper';
import { showWarningMessage } from './notifications/NotificationsHelper';

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
  negativeLabel: 'Cancel'
};

const FULL_JS_URL_LOAD_INFO: string =
  'For security concerns, users are not allowed to load full JavaScript code from shared links';

export function showFullJSDisclaimer(): Promise<boolean> {
  return showSimpleConfirmDialog(FULL_JS_DISCLAIMER_DIALOG_PROPS);
}

export function showFullJSWarningOnUrlLoad(): void {
  showWarningMessage(FULL_JS_URL_LOAD_INFO);
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
  negativeLabel: 'Cancel'
};

const FULL_TS_URL_LOAD_INFO: string =
  'For security concerns, users are not allowed to load full JavaScript code from shared links';

export function showFullTSDisclaimer(): Promise<boolean> {
  return showSimpleConfirmDialog(FULL_TS_DISCLAIMER_DIALOG_PROPS);
}

export function showFulTSWarningOnUrlLoad(): void {
  showWarningMessage(FULL_TS_URL_LOAD_INFO);
}

// HTML
const HTML_DISCLAIMER_DIALOG_PROPS: SimpleConfirmDialogProps = {
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
  return showSimpleConfirmDialog(HTML_DISCLAIMER_DIALOG_PROPS);
}
