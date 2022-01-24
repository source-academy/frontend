import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { Links } from '../utils/Constants';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DropdownAbout: React.SFC<DialogProps> = props => (
  <Dialog
    className="about"
    icon={IconNames.HELP}
    isCloseButtonShown={true}
    isOpen={props.isOpen}
    onClose={props.onClose}
    title="About"
  >
    <div className={Classes.DIALOG_BODY}>
      <div className="abt">
        <p>
          The <i>Source Academy</i> is a computer-mediated learning environment for studying the
          structure and interpretation of computer programs. Students write and run their programs
          in their web browser, using sublanguages of JavaScript called{' '}
          <a href={Links.sourceDocs}>Source</a>, designed for the textbook{' '}
          <a href={Links.textbook}>
            Structure and Interpretation of Computer Programs, JavaScript Edition
          </a>
          .
        </p>
        <p>
          The Source Academy is available under the Apache License 2.0 at the GitHub organisation{' '}
          <a href={Links.githubOrg}>source-academy</a>. More information and resources are available
          at the <a href={Links.about}>about pages</a> of the Source Academy.
        </p>
      </div>
    </div>
  </Dialog>
);

export default DropdownAbout;
