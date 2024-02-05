import {
  AnchorButton,
  Button,
  ButtonGroup,
  Checkbox,
  Classes,
  Divider,
  Slider
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import { debounce } from 'lodash';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';
import { Layout } from 'src/features/envVisualizer/EnvVisualizerLayout';

import { OverallState } from '../application/ApplicationTypes';
import { HighlightedLines } from '../editor/EditorTypes';
import Constants, { Links } from '../utils/Constants';
import { setEditorHighlightedLinesControl, updateEnvSteps } from '../workspace/WorkspaceActions';
import { evalEditor } from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';

type State = {
  visualization: React.ReactNode;
  value: number;
  height: number;
  width: number;
  lastStep: boolean;
  stepLimitExceeded: boolean;
};

type EnvVisualizerProps = OwnProps & StateProps & DispatchProps;

type StateProps = {
  editorWidth?: string;
  sideContentHeight?: number;
  numOfStepsTotal: number;
  numOfSteps: number;
  breakpointSteps: number[];
  needEnvUpdate: boolean;
};

type OwnProps = {
  workspaceLocation: WorkspaceLocation;
};

type DispatchProps = {
  handleEnvStepUpdate: (steps: number, workspaceLocation: WorkspaceLocation) => void;
  handleEditorEval: (workspaceLocation: WorkspaceLocation) => void;
  setEditorHighlightedLines: (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => void;
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
      value: -1,
      width: this.calculateWidth(props.editorWidth),
      height: this.calculateHeight(props.sideContentHeight),
      lastStep: false,
      stepLimitExceeded: false
    };
    EnvVisualizer.init(
      visualization => this.setState({ visualization }),
      this.state.width,
      this.state.height,
      (segments: [number, number][]) => {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        // This comment is copied over from workspace saga
        props.setEditorHighlightedLines(props.workspaceLocation, 0, segments);
      },
      isControlEmpty => {
        this.setState({ stepLimitExceeded: !isControlEmpty && this.state.lastStep });
      }
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

  componentDidUpdate(prevProps: {
    editorWidth?: string;
    sideContentHeight?: number;
    numOfStepsTotal: number;
    needEnvUpdate: boolean;
  }) {
    if (
      prevProps.sideContentHeight !== this.props.sideContentHeight ||
      prevProps.editorWidth !== this.props.editorWidth
    ) {
      this.handleResize();
    }
    if (prevProps.needEnvUpdate && !this.props.needEnvUpdate) {
      this.stepFirst();
      EnvVisualizer.clearEnv();
    }
  }

  public render() {
    const envVizHandlers = this.state.visualization
      ? {
          FIRST_STEP: this.stepFirst,
          NEXT_STEP: this.stepNext,
          PREVIOUS_STEP: this.stepPrevious,
          LAST_STEP: this.stepLast(this.props.numOfStepsTotal)
        }
      : {
          FIRST_STEP: () => {},
          NEXT_STEP: () => {},
          PREVIOUS_STEP: () => {},
          LAST_STEP: () => {}
        };

    return (
      <HotKeys
        keyMap={envVizKeyMap}
        handlers={envVizHandlers}
        style={{
          maxHeight: '100%',
          overflow: this.state.visualization ? 'hidden' : 'auto'
        }}
      >
        <div className={classNames('sa-substituter', Classes.DARK)}>
          <Slider
            disabled={!this.state.visualization}
            min={1}
            max={this.props.numOfStepsTotal}
            onChange={this.sliderShift}
            onRelease={this.sliderRelease}
            value={this.state.value < 1 ? 1 : this.state.value}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ButtonGroup>
              <Tooltip2 content="Control and Stash" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization && EnvVisualizer.getCompactLayout()) {
                      EnvVisualizer.toggleControlStash();
                      EnvVisualizer.redraw();
                    }
                  }}
                  icon="layers"
                  disabled={!this.state.visualization || !EnvVisualizer.getCompactLayout()}
                >
                  <Checkbox
                    checked={EnvVisualizer.getControlStash()}
                    disabled={!EnvVisualizer.getCompactLayout()}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip2>
              <Tooltip2 content="Truncate Control" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization && EnvVisualizer.getControlStash()) {
                      EnvVisualizer.toggleStackTruncated();
                      EnvVisualizer.redraw();
                    }
                  }}
                  icon="minimize"
                  disabled={!this.state.visualization || !EnvVisualizer.getControlStash()}
                >
                  <Checkbox
                    checked={EnvVisualizer.getStackTruncated()}
                    disabled={!EnvVisualizer.getControlStash()}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip2>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                disabled={!this.state.visualization}
                icon="double-chevron-left"
                onClick={this.stepPrevBreakpoint}
              />
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
              <Button
                disabled={!this.state.visualization}
                icon="double-chevron-right"
                onClick={this.stepNextBreakpoint}
              />
            </ButtonGroup>
            <ButtonGroup>
              <Tooltip2 content="Experimental" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization) {
                      EnvVisualizer.toggleCompactLayout();
                      EnvVisualizer.redraw();
                    }
                  }}
                  icon="build"
                  disabled={!this.state.visualization}
                >
                  <Checkbox
                    checked={!EnvVisualizer.getCompactLayout()}
                    disabled={!this.state.visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip2>
              <Tooltip2 content="Print" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization) {
                      EnvVisualizer.togglePrintableMode();
                      EnvVisualizer.redraw();
                    }
                  }}
                  icon="print"
                  disabled={!this.state.visualization}
                >
                  <Checkbox
                    disabled={!this.state.visualization}
                    checked={EnvVisualizer.getPrintableMode()}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip2>
              <Tooltip2 content="Save" compact>
                <AnchorButton
                  icon="floppy-disk"
                  disabled={!this.state.visualization}
                  onClick={Layout.exportImage}
                />
              </Tooltip2>
            </ButtonGroup>
          </div>
        </div>{' '}
        {this.state.visualization ? (
          this.state.stepLimitExceeded ? (
            <div
              id="env-visualizer-default-text"
              className={Classes.RUNNING_TEXT}
              data-testid="env-visualizer-default-text"
            >
              Maximum number of steps exceeded.
              <Divider />
              Please increase the step limit if you would like to see futher evaluation.
            </div>
          ) : (
            this.state.visualization
          )
        ) : (
          <div
            id="env-visualizer-default-text"
            className={Classes.RUNNING_TEXT}
            data-testid="env-visualizer-default-text"
          >
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
            <br /> On this tab, the REPL will be hidden from view, so do check that your code has no
            errors before running the stepper. You may use this tool by running your program and
            then dragging the slider above to see the state of the environment at different stages
            in the evaluation of your program. Clicking on the fast-forward button (double chevron)
            will take you to the next breakpoint in your program
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
          </div>
        )}
        <ButtonGroup
          vertical={true}
          style={{ position: 'absolute', bottom: '20px', right: '20px' }}
        >
          <Button
            icon="plus"
            disabled={!this.state.visualization}
            onClick={() => Layout.zoomStage(true, 5)}
            style={{ marginBottom: '5px', borderRadius: '3px' }}
          />
          <Button
            icon="minus"
            disabled={!this.state.visualization}
            onClick={() => Layout.zoomStage(false, 5)}
            style={{ borderRadius: '3px' }}
          />
        </ButtonGroup>
      </HotKeys>
    );
  }

  private sliderRelease = (newValue: number) => {
    if (newValue === this.props.numOfStepsTotal) {
      this.setState({ lastStep: true });
    } else {
      this.setState({ lastStep: false });
    }
    this.props.handleEditorEval(this.props.workspaceLocation);
  };

  private sliderShift = (newValue: number) => {
    this.props.handleEnvStepUpdate(newValue, this.props.workspaceLocation);
    this.setState((state: State) => {
      return { value: newValue };
    });
  };

  private stepPrevious = () => {
    if (this.state.value !== 1) {
      this.sliderShift(this.state.value - 1);
      this.sliderRelease(this.state.value - 1);
    }
  };

  private stepNext = () => {
    const lastStepValue = this.props.numOfStepsTotal;
    if (this.state.value !== lastStepValue) {
      this.sliderShift(this.state.value + 1);
      this.sliderRelease(this.state.value + 1);
    }
  };

  private stepFirst = () => {
    // Move to the first step
    this.sliderShift(1);
    this.sliderRelease(1);
  };

  private stepLast = (lastStepValue: number) => () => {
    // Move to the last step
    this.sliderShift(lastStepValue);
    this.sliderRelease(lastStepValue);
  };

  private stepNextBreakpoint = () => {
    for (const step of this.props.breakpointSteps) {
      if (step > this.state.value) {
        this.sliderShift(step);
        this.sliderRelease(step);
        return;
      }
    }
    this.sliderShift(this.props.numOfStepsTotal);
    this.sliderRelease(this.props.numOfStepsTotal);
  };

  private stepPrevBreakpoint = () => {
    for (let i = this.props.breakpointSteps.length - 1; i >= 0; i--) {
      const step = this.props.breakpointSteps[i];
      if (step < this.state.value) {
        this.sliderShift(step);
        this.sliderRelease(step);
        return;
      }
    }
    this.sliderShift(1);
    this.sliderRelease(1);
  };
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (
  state: OverallState,
  ownProps: OwnProps
) => {
  let workspaceLocation: WorkspaceLocation;
  if (ownProps.workspaceLocation === 'playground' || ownProps.workspaceLocation === 'sicp') {
    workspaceLocation = ownProps.workspaceLocation;
  } else {
    workspaceLocation = 'playground';
  }
  return {
    ...ownProps,
    numOfStepsTotal: state.workspaces[workspaceLocation].envStepsTotal,
    numOfSteps: state.workspaces[workspaceLocation].envSteps,
    breakpointSteps: state.workspaces[workspaceLocation].breakpointSteps,
    needEnvUpdate: state.workspaces[workspaceLocation].updateEnv
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleEditorEval: (workspaceLocation: WorkspaceLocation) => evalEditor(workspaceLocation),
      handleEnvStepUpdate: (steps: number, workspaceLocation: WorkspaceLocation) =>
        updateEnvSteps(steps, workspaceLocation),
      setEditorHighlightedLines: (
        workspaceLocation: WorkspaceLocation,
        editorTabIndex: number,
        newHighlightedLines: HighlightedLines[]
      ) => setEditorHighlightedLinesControl(workspaceLocation, editorTabIndex, newHighlightedLines)
    },
    dispatch
  );

const SideContentEnvVisualizerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SideContentEnvVisualizer);

export default SideContentEnvVisualizerContainer;
