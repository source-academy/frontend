import { Classes } from '@blueprintjs/core';
import * as React from 'react';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';

import { Links } from '../utils/Constants';

type State = {
  visualization: React.ReactNode;
};

class SideContentEnvVisualizer extends React.Component<{ width?: number; height?: number }, State> {
  constructor(props: any) {
    super(props);
    this.state = { visualization: null };
    EnvVisualizer.init(
      visualization => this.setState({ visualization }),
      props.width,
      props.height
    );
  }

  componentDidUpdate(prevProps: { width?: number; height?: number }) {
    if (
      (prevProps.width !== this.props.width || prevProps.height !== this.props.height) &&
      this.props.width &&
      this.props.height
    ) {
      EnvVisualizer.updateDimensions(this.props.width, this.props.height);
    }
  }

  public render() {
    return (
      <div className={Classes.DARK}>
        {this.state.visualization || (
          <p id="env-visualizer-default-text" className={Classes.RUNNING_TEXT}>
            The environment model visualizer generates environment model diagrams following a
            notation introduced in{' '}
            <a href={Links.textbookChapter3_2} rel="noopener noreferrer" target="_blank">
              <i>
                Structure and Interpretation of Computer Programs, JavaScript Edition, Chapter 3,
                Section 2
              </i>
            </a>
            .
            <br />
            <br />
            It is activated by setting breakpoints before you run the program. You can set a
            breakpoint by clicking on the gutter of the editor (where all the line numbers are, on
            the left). When the program runs into a breakpoint, the visualizer displays the state of
            the environments before the statement is evaluated, which starts in the line in which
            you set the breakpoint. Every breakpoint must be at the beginning of a statement.
          </p>
        )}
      </div>
    );
  }
}

export default SideContentEnvVisualizer;
