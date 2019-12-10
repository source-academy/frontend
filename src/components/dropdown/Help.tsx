import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { LINKS } from '../../utils/constants';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Help: React.SFC<DialogProps> = props => (
  <Dialog
    className="help"
    icon={IconNames.ERROR}
    isCloseButtonShown={false}
    isOpen={props.isOpen}
    onClose={props.onClose}
    title="Help"
  >
    <div className={Classes.DIALOG_BODY}>
      <p>Please use the following resources when you encounter issues with this system.</p>
      <p>
        As of August 2019, we recommend the browsers <b>Google Chrome</b>, Version 75 or higher, or{' '}
        <b>Mozilla Firefox</b>, Version 70 or higher, to visit the Source Academy. If you encounter
        issues with the Source Academy using these browsers, please use the following resources.
      </p>
      <ul>
        <li>
          For critical technical issues that seriously affect your learning experience, email the
          Technical Services of the NUS School of Computing at{' '}
          <a href={LINKS.TECH_SVC}>techsvc@comp.nus.edu.sg</a> or call 6516 2736.
        </li>
        <li>
          For non-critical technical issues, such as enhancement suggestions, please use the issue
          system of the <a href={LINKS.GITHUB_ISSUES}>Source Academy repositories on GitHub</a>.
        </li>
        <li>
          For issues related to the content of missions, quests, paths and contests, use the
          respective forum at <a href={LINKS.PIAZZA}> piazza</a>, or approach your Avenger,
          Reflection instructor or lecturer.
        </li>
      </ul>
    </div>
  </Dialog>
);

export default Help;
