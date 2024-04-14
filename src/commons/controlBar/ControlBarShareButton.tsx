import { NonIdealState, Popover, Position, Spinner, SpinnerSize, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useHotkeys } from '@mantine/hooks';
import React, { useRef, useState } from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { usePlaygroundConfigurationEncoder } from 'src/features/playground/shareLinks/encoder/Encoder';
import ShareLinkState from 'src/features/playground/shareLinks/ShareLinkState';

import ControlButton from '../ControlButton';
import { postSharedProgram } from '../sagas/RequestsSaga';
import Constants from '../utils/Constants';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { request } from '../utils/RequestHelper';
import { RemoveLast } from '../utils/TypeHelper';

type ControlBarShareButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleGenerateLz?: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
};

type StateProps = {
  queryString?: string;
  shortURL?: string;
  key: string;
  isSicp?: boolean;
  programConfig: ShareLinkState;
  token: Tokens;
};

type ShareLinkRequestHelperParams = RemoveLast<Parameters<typeof request>>;

export type Tokens = {
  accessToken: string | undefined;
  refreshToken: string | undefined;
};

export const requestToShareProgram = async (
  ...[path, method, opts]: ShareLinkRequestHelperParams
) => {
  const resp = await request(path, method, opts);
  return resp;
};

export const ControlBarShareButton: React.FC<ControlBarShareButtonProps> = props => {
  const shareInputElem = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [customStringKeyword, setCustomStringKeyword] = useState('');
  const playgroundConfiguration = usePlaygroundConfigurationEncoder();

  const generateLink = () => {
    setIsLoading(true);

    customStringKeyword;

    return postSharedProgram(playgroundConfiguration)
      .then(({ shortenedUrl }) => setShortenedUrl(shortenedUrl))
      .catch(err => showWarningMessage(err.toString()))
      .finally(() => setIsLoading(false));
  };
  useHotkeys([['ctrl+w', generateLink]], []);

  const handleCustomStringChange = (event: React.FormEvent<HTMLInputElement>) => {
    setCustomStringKeyword(event.currentTarget.value);
  };

  // For visual effect of highlighting the text field on copy
  const selectShareInputText = () => {
    if (shareInputElem.current !== null) {
      shareInputElem.current.focus();
      shareInputElem.current.select();
    }
  };

  const generateLinkPopoverContent = (
    <div>
      {Constants.urlShortenerBase}&nbsp;
      <input
        placeholder={'custom string (optional)'}
        onChange={handleCustomStringChange}
        style={{ width: 175 }}
      />
      <ControlButton label="Get Link" icon={IconNames.SHARE} onClick={generateLink} />
    </div>
  );

  const generatingLinkPopoverContent = (
    <div>
      <NonIdealState
        description="Generating Shareable Link..."
        icon={<Spinner size={SpinnerSize.SMALL} />}
      />
    </div>
  );

  const sicpCopyLinkPopoverContent = (
    <div>
      <input defaultValue={props.queryString!} readOnly={true} ref={shareInputElem} />
      <Tooltip content="Copy link to clipboard">
        <CopyToClipboard text={props.queryString!}>
          <ControlButton icon={IconNames.DUPLICATE} onClick={selectShareInputText} />
        </CopyToClipboard>
      </Tooltip>
    </div>
  );

  const copyLinkPopoverContent = (
    <div key={shortenedUrl}>
      <input defaultValue={shortenedUrl} readOnly={true} ref={shareInputElem} />
      <Tooltip content="Copy link to clipboard">
        <CopyToClipboard text={shortenedUrl}>
          <ControlButton icon={IconNames.DUPLICATE} onClick={selectShareInputText} />
        </CopyToClipboard>
      </Tooltip>
    </div>
  );

  const shareButtonPopoverContent = isLoading
    ? generatingLinkPopoverContent
    : props.isSicp
    ? sicpCopyLinkPopoverContent
    : shortenedUrl
    ? copyLinkPopoverContent
    : generateLinkPopoverContent;

  return (
    <Popover
      popoverClassName="Popover-share"
      inheritDarkTheme={false}
      content={shareButtonPopoverContent}
    >
      <Tooltip content="Get shareable link" placement={Position.TOP}>
        <ControlButton label="Share" icon={IconNames.SHARE} />
      </Tooltip>
    </Popover>
  );
};
