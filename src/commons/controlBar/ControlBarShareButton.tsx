import { NonIdealState, Popover, Position, Spinner, SpinnerSize, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useHotkeys } from '@mantine/hooks';
import React, { useRef, useState } from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import JsonEncoderDelegate from 'src/features/playground/shareLinks/encoder/delegates/JsonEncoderDelegate';
import UrlParamsEncoderDelegate from 'src/features/playground/shareLinks/encoder/delegates/UrlParamsEncoderDelegate';
import { usePlaygroundConfigurationEncoder } from 'src/features/playground/shareLinks/encoder/EncoderHooks';

import ControlButton from '../ControlButton';
import { externalUrlShortenerRequest } from '../sagas/PlaygroundSaga';
import { postSharedProgram } from '../sagas/RequestsSaga';
import Constants, { Links } from '../utils/Constants';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';

type ControlBarShareButtonProps = {
  isSicp?: boolean;
};

/**
 * Generates the share link for programs in the Playground.
 *
 * For playground-only (no backend) deployments:
 * - Generate a URL with playground configuration encoded as hash parameters
 * - URL sent to external URL shortener service
 * - Shortened URL displayed to user
 * - (note: SICP CodeSnippets use these hash parameters)
 *
 * For 'with backend' deployments:
 * - Send the playground configuration to the backend
 * - Backend stores configuration and assigns a UUID
 * - Backend pings the external URL shortener service with UUID link
 * - Shortened URL returned to Frontend and displayed to user
 */
export const ControlBarShareButton: React.FC<ControlBarShareButtonProps> = props => {
  const shareInputElem = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [customStringKeyword, setCustomStringKeyword] = useState('');
  const playgroundConfiguration = usePlaygroundConfigurationEncoder();

  const generateLinkBackend = () => {
    setIsLoading(true);

    customStringKeyword;

    const configuration = playgroundConfiguration.encodeWith(new JsonEncoderDelegate());

    return postSharedProgram(configuration)
      .then(({ shortenedUrl }) => setShortenedUrl(shortenedUrl))
      .catch(err => showWarningMessage(err.toString()))
      .finally(() => setIsLoading(false));
  };

  const generateLinkPlaygroundOnly = () => {
    const hash = playgroundConfiguration.encodeWith(new UrlParamsEncoderDelegate());
    setIsLoading(true);

    return externalUrlShortenerRequest(hash, customStringKeyword)
      .then(({ shortenedUrl, message }) => {
        setShortenedUrl(shortenedUrl);
        if (message) showSuccessMessage(message);
      })
      .catch(err => showWarningMessage(err.toString()))
      .finally(() => setIsLoading(false));
  };

  const generateLinkSicp = () => {
    const hash = playgroundConfiguration.encodeWith(new UrlParamsEncoderDelegate());
    const shortenedUrl = `${Links.playground}#${hash}`;
    setShortenedUrl(shortenedUrl);
  };

  const generateLink = props.isSicp
    ? generateLinkSicp
    : Constants.playgroundOnly
    ? generateLinkPlaygroundOnly
    : generateLinkBackend;

  useHotkeys([['ctrl+e', generateLink]], []);

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
