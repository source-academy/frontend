import { Dialog, DialogBody } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import Markdown from '../Markdown';
import { Links } from '../utils/Constants';
import { useTypedSelector } from '../utils/Hooks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DropdownHelp: React.FC<Props> = props => {
  const moduleHelpText = useTypedSelector(store => store.session.moduleHelpText);

  return (
    <Dialog
      style={{ textAlign: 'justify' }}
      icon={IconNames.ERROR}
      isCloseButtonShown
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Help"
    >
      <DialogBody>
        {moduleHelpText ? (
          <Markdown content={moduleHelpText} openLinksInNewWindow />
        ) : (
          <>
            <p>
              We recommend recent updates of the browsers <b>Google Chrome</b>,{' '}
              <b>Microsoft Edge</b>, or <b>Mozilla Firefox</b> to visit the Source Academy.
            </p>
            <p>
              If you encounter issues with the Source Academy using these browsers, please use the
              issue system of the{' '}
              <a href={Links.githubIssues}>Source Academy frontend repository on GitHub</a>.
            </p>
          </>
        )}
      </DialogBody>
    </Dialog>
  );
};
export default DropdownHelp;
