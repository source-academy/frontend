import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import Markdown from '../Markdown';
import { Links } from '../utils/Constants';
import { useTypedSelector } from '../utils/Hooks';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DropdownHelp: React.SFC<DialogProps> = props => {
  const moduleHelpText = useTypedSelector(store => store.session.moduleHelpText);

  return (
    <Dialog
      className="help"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Help"
    >
      <div className={Classes.DIALOG_BODY}>
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
      </div>
    </Dialog>
  );
};
export default DropdownHelp;
