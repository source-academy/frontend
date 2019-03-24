// import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

export class HelpTab extends React.Component<{}, {}> {
  public constructor(props: {}) {
    super(props);
  }

  public render() {
    return this.helpTab();
  }

  private helpTab = () => {
    return (
      <div>
        Mission-specific tabs:<br />
        Modify mission brief in the ission Briefing tab by clicking on the text<br />
        Insert questions at the current question index or delete the current question in the
        Add/Delete Questions tab<br />
        The Source version, library and globals for all questions in the mission can be modified in
        Global Deployment<br />
        <br />
        Question-specific tabs:<br />
        Modify question description in Task tab<br />
        Modify question template in Question template tab<br />
        The Source version, library and globals for the current question can be modified in Global
        Deployment<br />
        Modify grading in Grading tab<br />
      </div>
    );
  };
}

export default HelpTab;
