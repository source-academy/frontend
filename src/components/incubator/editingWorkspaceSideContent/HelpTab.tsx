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
        Mission Briefing: Modify mission brief by clicking on the text<br />
        Add/Delete Questions: Insert questions at the current question index or delete the current question<br />
        Global Deployment: Modify the Source version, library and globals for all questions in the mission<br />
        <br />
        Question-specific tabs:<br />
        Task: Modify question descriptio<br />
        Question Template: Modify question template in Question template tab<br />
        Local Deployment: Modify the Source version, library and globals for the current question<br />
        Grading: Modify grading<br />
      </div>
    );
  };
}

export default HelpTab;
