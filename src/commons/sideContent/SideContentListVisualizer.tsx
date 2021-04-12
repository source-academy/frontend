import { Button, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';

import ListVisualizer from '../../features/listVisualizer/ListVisualizer';
import { Step } from '../../features/listVisualizer/ListVisualizerTypes';
import { Links } from '../utils/Constants';

type State = {
  steps: Step[];
  currentStep: number;
};

const listVisualizerKeyMap = {
  PREVIOUS_STEP: 'left',
  NEXT_STEP: 'right'
};

/**
 * This class is responsible for the visualization of data structures via the
 * data_data function in Source. It adds a listener to the ListVisualizer singleton
 * which updates the steps list via setState whenever new steps are added.
 */
class SideContentListVisualizer extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { steps: [], currentStep: 0 };
    ListVisualizer.init(steps => {
      if (!steps) {
        //  Blink icon
        const icon = document.getElementById('data_visualiser-icon');

        if (icon) {
          icon.classList.add('side-content-tab-alert');
        }
      }
      this.setState({ steps, currentStep: 0 });
    });
  }

  public render() {
    const listVisualizerHandlers = {
      PREVIOUS_STEP: this.onPrevButtonClick,
      NEXT_STEP: this.onNextButtonClick
    };
    const step: Step | undefined = this.state.steps[this.state.currentStep];

    return (
      <HotKeys keyMap={listVisualizerKeyMap} handlers={listVisualizerHandlers}>
        <div className={classNames('sa-list-visualizer', Classes.DARK)}>
          {this.state.steps.length > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                large={true}
                outlined={true}
                icon={IconNames.ARROW_LEFT}
                onClick={this.onPrevButtonClick}
                disabled={this.state.currentStep === 0}
              >
                Prev
              </Button>
              <h3
                className="bp3-text-large"
                style={{ alignSelf: 'center', display: 'inline', margin: 0 }}
              >
                Call {this.state.currentStep + 1}/{this.state.steps.length}
              </h3>
              <Button
                large={true}
                outlined={true}
                icon={IconNames.ARROW_RIGHT}
                onClick={this.onNextButtonClick}
                disabled={
                  this.state.steps.length > 0
                    ? this.state.currentStep === this.state.steps.length - 1
                    : true
                }
              >
                Next
              </Button>
            </div>
          ) : null}
          {this.state.steps ? (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {step?.map((elem, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <h3>Structure {i + 1}</h3>
                  {elem}
                </div>
              ))}
            </div>
          ) : (
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
                  Structure and Interpretation of Computer Programs, JavaScript Adaptation, Chapter
                  2, Section 2
                </i>
              </a>
              .
            </p>
          )}
        </div>
      </HotKeys>
    );
  }

  private onPrevButtonClick = () => {
    this.setState(state => {
      return { currentStep: state.currentStep - 1 };
    });
  };

  private onNextButtonClick = () => {
    this.setState(state => {
      return { currentStep: state.currentStep + 1 };
    });
  };
}

export default SideContentListVisualizer;
