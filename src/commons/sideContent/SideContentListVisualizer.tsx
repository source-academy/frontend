import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

import ListVisualizer from '../../features/listVisualizer/ListVisualizer';
import { Links } from '../utils/Constants';

type State = {
  visualization: React.ReactNode,
};

class SideContentListVisualizer extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { visualization: null };
    ListVisualizer.init(visualization => this.setState({ visualization }))
  }
  
  public render() {
    // Default text will be hidden by visualizer.js when 'draw_data' is called
    return (

      <div className={classNames('sa-list-visualizer', Classes.DARK)}>
        {
          this.state.visualization ||
          <p id="data-visualizer-default-text" className={Classes.RUNNING_TEXT}>
            The data visualizer visualises data structures.
            <br />
            <br />
            It is activated by calling the function <code>draw_data(the_data)</code>, where{' '}
            <code>the_data</code> would be the data structure that you want to visualise.
            <br />
            <br />
            The data visualizer uses box-and-pointer diagrams, as introduced in{' '}
            <a href={Links.textbookChapter2_2} rel="noopener noreferrer" target="_blank">
              <i>
                Structure and Interpretation of Computer Programs, JavaScript Adaptation, Chapter 2,
                Section 2
              </i>
            </a>
            .
          </p>
        }
      </div>
    );
  }
}

export default SideContentListVisualizer;
