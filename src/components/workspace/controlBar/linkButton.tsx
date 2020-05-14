import { GOOGLE_CLIENT_ID } from '../../../utils/constants';

import { IconNames } from '@blueprintjs/icons';

import { controlButton } from '../../commons';

export type linkButtonProps = {
  key: string;
};

export function LinkButton(props: linkButtonProps) {
  const redirectUrl = `${window.location.protocol}//${window.location.host}/playground`;
  const linkurl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=token&scope=profile+email+https://www.googleapis.com/auth/drive.file`;

  return controlButton('Link to Google Drive', IconNames.DOCUMENT_SHARE, () =>
    window.location.assign(linkurl)
  );
}
