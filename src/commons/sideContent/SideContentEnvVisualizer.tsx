import { Classes } from '@blueprintjs/core';
import * as React from 'react';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';

import { Links } from '../utils/Constants';

type State = {
  visualization: React.ReactNode;
};

class SideContentEnvVisualizer extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { visualization: null };
    EnvVisualizer.init(visualization => this.setState({ visualization }));
  }

  public render() {
    return (
      <div className={Classes.DARK}>
        {this.state.visualization || (
          <p id="env-visualizer-default-text" className={Classes.RUNNING_TEXT}>
            The environmental visualizer generates the environmental model diagram based on
            breakpoints set in the editor.
            <br />
            <br />
            It is activated by clicking on the gutter of the editor (where all the line numbers are,
            on the left) to set a breakpoint, and then running the program.
            <br />
            <br />
            The environment model diagram follows a notation introduced in{' '}
            <a href={Links.textbookChapter3_2} rel="noopener noreferrer" target="_blank">
              <i>
                Structure and Interpretation of Computer Programs, JavaScript Edition, Chapter 3,
                Section 2
              </i>
            </a>
            .
          </p>
        )}
      </div>
    );
  }
}

export default SideContentEnvVisualizer;
