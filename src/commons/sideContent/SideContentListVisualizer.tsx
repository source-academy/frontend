import { Button, Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';

import { Links } from '../utils/Constants';

type State = {
  loading: boolean;
};

const listVisualizerKeyMap = {
  PREVIOUS_STEP: 'left',
  NEXT_STEP: 'right'
};

class SideContentListVisualizer extends React.Component<{}, State> {
  private $parent: HTMLElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = { loading: true };
  }

  public componentDidMount() {
    this.tryToLoad();
  }

  public render() {
    const listVisualizerHandlers = {
      PREVIOUS_STEP: this.onPrevButtonClick,
      NEXT_STEP: this.onNextButtonClick
    };

    const listVisualizer = (window as any).ListVisualizer;
    // Default text will be hidden by visualizer.js when 'draw_data' is called
    return (
      <HotKeys keyMap={listVisualizerKeyMap} handlers={listVisualizerHandlers}>
        <div
          ref={r => (this.$parent = r)}
          className={classNames('sa-list-visualizer', Classes.DARK)}
        >
          {(listVisualizer?.getStepCount() ?? 0) > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                large={true}
                outlined={true}
                icon={IconNames.ARROW_LEFT}
                onClick={this.onPrevButtonClick}
                disabled={(listVisualizer?.getCurrentStep() ?? 1) === 1}
              >
                Prev
              </Button>
              <h3
                className="bp3-text-large"
                style={{ alignSelf: 'center', display: 'inline', margin: 0 }}
              >
                Call {listVisualizer?.getCurrentStep() ?? '0'}/{listVisualizer?.getStepCount()}
              </h3>
              <Button
                large={true}
                outlined={true}
                icon={IconNames.ARROW_RIGHT}
                onClick={this.onNextButtonClick}
                disabled={
                  listVisualizer
                    ? listVisualizer.getCurrentStep() === listVisualizer.getStepCount()
                    : true
                }
              >
                Next
              </Button>
            </div>
          ) : null}
          <p
            id="data-visualizer-default-text"
            className={Classes.RUNNING_TEXT}
            hidden={listVisualizer?.hasDrawing() ?? false}
          >
            The data visualizer visualizes data structures.
            <br />
            <br />
            It is activated by calling the function <code>draw_data(the_data)</code>, where{' '}
            <code>the_data</code> would be the data structure that you want to visualize.
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
          {this.state.loading && (
            <NonIdealState description="Loading Data Visualizer..." icon={<Spinner />} />
          )}
        </div>
      </HotKeys>
    );
  }

  private onPrevButtonClick = () => {
    const element = (window as any).ListVisualizer;
    element.previous();
    this.setState({});
  };

  private onNextButtonClick = () => {
    const element = (window as any).ListVisualizer;
    element.next();
    this.setState({});
  };

  private tryToLoad = () => {
    const element = (window as any).ListVisualizer;
    if (this.$parent && element) {
      // List Visualizer has been loaded into the DOM
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

export default SideContentListVisualizer;
