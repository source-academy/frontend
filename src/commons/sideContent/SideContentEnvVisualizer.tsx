import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

import { Links } from '../utils/Constants';

type State = {
  loading: boolean;
};

class SideContentEnvVisualizer extends React.Component<{}, State> {
  private $parent: HTMLElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = { loading: true };
  }

  public componentDidMount() {
    this.tryToLoad();
  }

  public render() {
    return (
      <div ref={r => (this.$parent = r)} className={classNames('sa-env-visualizer', Classes.DARK)}>
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
              Structure and Interpretation of Computer Programs, JavaScript Adaptation, Chapter 3,
              Section 2
            </i>
          </a>
          .
        </p>
        {this.state.loading && (
          <NonIdealState description="Loading Env Visualizer..." icon={<Spinner />} />
        )}
      </div>
    );
  }

  private tryToLoad = () => {
    const element = (window as any).EnvVisualizer;
    if (this.$parent && element) {
      // Env Visualizer has been loaded into the DOM
      element.init(this.$parent);
      this.setState((state, props) => {
        return { loading: false };
      });
    } else {
      // Try again in 1 second
      window.setTimeout(this.tryToLoad, 1000);
    }
  };
}

export default SideContentEnvVisualizer;
