import { Button, ButtonGroup, Classes, Divider, Slider } from '@blueprintjs/core';
import { debounce } from 'lodash';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';

import { OverallState } from '../application/ApplicationTypes';
import Constants, { Links } from '../utils/Constants';
import { updateEnvSteps } from '../workspace/WorkspaceActions';

type State = {
  visualization: React.ReactNode;
  value: number;
  height: number;
  width: number;
};

type EnvVisualizerProps = StateProps & DispatchProps;

type StateProps = {
  handleEditorEval: () => void;
  editorWidth?: string;
  sideContentHeight?: number;
  numOfSteps?: number;
};

type DispatchProps = {
  handleStepUpdate?: (steps: number) => void;
};

const envVizKeyMap = {
  FIRST_STEP: 'a',
  NEXT_STEP: 'f',
  PREVIOUS_STEP: 'b',
  LAST_STEP: 'e'
};

class SideContentEnvVisualizer extends React.Component<EnvVisualizerProps, State> {
  constructor(props: EnvVisualizerProps) {
    super(props);
    this.state = {
      visualization: null,
      value: 1,
      width: this.calculateWidth(props.editorWidth),
      height: this.calculateHeight(props.sideContentHeight)
    };
    EnvVisualizer.init(
      visualization => this.setState({ visualization }),
      this.state.width,
      this.state.height
    );
  }

  private calculateWidth(editorWidth?: string) {
    const horizontalPadding = 50;
    const maxWidth = 5000; // limit for visible diagram width for huge screens
    let width;
    if (editorWidth === undefined) {
      width = window.innerWidth - horizontalPadding;
    } else {
      width = Math.min(
        maxWidth,
        (window.innerWidth * (100 - parseFloat(editorWidth))) / 100 - horizontalPadding
      );
    }
    return Math.min(width, maxWidth);
  }

  private calculateHeight(sideContentHeight?: number) {
    const verticalPadding = 150;
    const maxHeight = 5000; // limit for visible diagram height for huge screens
    let height;
    if (window.innerWidth < Constants.mobileBreakpoint) {
      // mobile mode
      height = window.innerHeight - verticalPadding;
    } else if (sideContentHeight === undefined) {
      height = window.innerHeight - verticalPadding;
    } else {
      height = sideContentHeight - verticalPadding;
    }
    return Math.min(height, maxHeight);
  }

  handleResize = debounce(() => {
    const newWidth = this.calculateWidth(this.props.editorWidth);
    const newHeight = this.calculateHeight(this.props.sideContentHeight);
    if (newWidth !== this.state.width || newHeight !== this.state.height) {
      this.setState({
        height: newHeight,
        width: newWidth
      });
      EnvVisualizer.updateDimensions(newWidth, newHeight);
    }
  }, 300);

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    EnvVisualizer.redraw();
  }
  componentWillUnmount() {
    this.handleResize.cancel();
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(
    prevProps: { editorWidth?: string; sideContentHeight?: number; numOfSteps?: number },
    prevState: State
  ) {
    if (
      prevProps.sideContentHeight !== this.props.sideContentHeight ||
      prevProps.editorWidth !== this.props.editorWidth
    ) {
      this.handleResize();
    }
  }

  public render() {
    const envVizHandlers = this.state.visualization
      ? {
          FIRST_STEP: this.stepFirst,
          NEXT_STEP: this.stepNext,
          PREVIOUS_STEP: this.stepPrevious,
          LAST_STEP: this.stepLast(this.props.numOfSteps!)
        }
      : {
          FIRST_STEP: () => {},
          NEXT_STEP: () => {},
          PREVIOUS_STEP: () => {},
          LAST_STEP: () => {}
        };

    return (
      <HotKeys keyMap={envVizKeyMap} handlers={envVizHandlers}>
        <div className={Classes.DARK}>
          <div
            className={'sa-substituter'}
            style={{ position: 'sticky', top: '0', left: '0', zIndex: '1' }}
          >
            <Slider
              disabled={!this.state.visualization}
              min={1}
              max={this.props.numOfSteps}
              onChange={this.sliderShift}
              onRelease={this.sliderRelease}
              value={this.state.value}
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ButtonGroup>
                {/* <Button
                  disabled={!this.state.visualization} 
                  icon="double-chevron-left"
                  onClick={() => {}} 
                /> */}{' '}
                {/* Not sure how to define this yet, or if it is even useful.*/}
                <Button
                  disabled={!this.state.visualization}
                  icon="chevron-left"
                  onClick={this.stepPrevious}
                />
                <Button
                  disabled={!this.state.visualization}
                  icon="chevron-right"
                  onClick={this.stepNext}
                />
                {/* <Button
                  disabled={!this.state.visualization} 
                  icon="double-chevron-right"
                  onClick={() => {}} 
                /> */}{' '}
                {/* Not sure how to define this yet, or if it is even useful.*/}
              </ButtonGroup>
            </div>
          </div>
          <br />
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
              <br /> On this tab, the REPL will be hidden from view, so do check that your code has
              no errors before running the stepper. You may use this tool by running your program
              and then dragging the slider above to see the state of the environment at different
              stages in the evaluation of your program.
              <br />
              <br />
              <Divider />
              Some useful keyboard shortcuts:
              <br />
              <br />
              a: Move to the first step
              <br />
              e: Move to the last step
              <br />
              f: Move to the next step
              <br />
              b: Move to the previous step
              <br />
              <br />
              Note that these shortcuts are only active when the browser focus is on this tab.
            </p>
          )}
        </div>
      </HotKeys>
    );
  }

  private sliderRelease = (newValue: number) => {
    this.props.handleEditorEval();
  };

  private sliderShift = (newValue: number) => {
    this.props.handleStepUpdate!(newValue);
    this.setState((state: State) => {
      return { value: newValue };
    });
  };

  private stepPrevious = () => {
    if (this.state.value !== 1) {
      this.sliderShift(this.state.value - 1);
      this.props.handleEditorEval();
    }
  };

  private stepNext = () => {
    const lastStepValue = this.props.numOfSteps;
    if (this.state.value !== lastStepValue) {
      this.sliderShift(this.state.value + 1);
      this.props.handleEditorEval();
    }
  };

  private stepFirst = () => {
    // Move to the first step
    this.sliderShift(1);
    this.props.handleEditorEval();
  };

  private stepLast = (lastStepValue: number) => () => {
    // Move to the last step
    this.sliderShift(lastStepValue);
    this.props.handleEditorEval();
  };
}

const mapStateToProps = (state: OverallState, ownProps: EnvVisualizerProps) => {
  return {
    ...ownProps,
    numOfSteps: state.workspaces.playground.envStepsTotal
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleStepUpdate: (steps: number) => updateEnvSteps(steps, 'playground') // TODO: Pass workspace location as a prop, so this can be done for any workspace location
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SideContentEnvVisualizer);
