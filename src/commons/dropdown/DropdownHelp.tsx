import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import Markdown from '../Markdown';
import { Links } from '../utils/Constants';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DropdownHelp: React.SFC<DialogProps> = props => {
  const moduleHelpText = useSelector((store: OverallState) => store.session.moduleHelpText);

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
            <p>Please use the following resources when you encounter issues with this system.</p>
            <p>
              As of August 2020, we recommend the browsers <b>Google Chrome</b> or{' '}
              <b>Microsoft Edge</b>, Version 83 or higher, or <b>Mozilla Firefox</b>, Version 78 or
              higher, to visit the Source Academy. If you encounter issues with the Source Academy
              using these browsers, please use the following resources.
            </p>
            <ul>
              <li>
                For critical technical issues that seriously affect your learning experience, email
                the Technical Services of the NUS School of Computing at{' '}
                <a href={Links.techSVC}>{new URL(Links.techSVC).pathname}</a> or call{' '}
                {Links.techSVCNumber}.
              </li>
              <li>
                For non-critical technical issues, such as enhancement suggestions, please use the
                issue system of the{' '}
                <a href={Links.githubIssues}>Source Academy repositories on GitHub</a>.
              </li>
              <li>
                For issues related to the content of missions, quests, paths and contests, use the
                respective forum at <a href={Links.piazza}>Piazza</a>, or approach your Avenger,
                Reflection instructor or lecturer.
              </li>
            </ul>
          </>
        )}
      </div>
    </Dialog>
  );
};
export default DropdownHelp;
