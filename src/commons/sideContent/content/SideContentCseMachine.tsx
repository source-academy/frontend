import {
  AnchorButton,
  Button,
  ButtonGroup,
  Checkbox,
  Classes,
  Divider,
  Slider
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import { debounce } from 'lodash';
import React from 'react';
import { HotKeys } from 'react-hotkeys';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { PlaygroundWorkspaceState } from 'src/commons/workspace/WorkspaceTypes';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { CseAnimation } from 'src/features/cseMachine/CseMachineAnimation';
import { Layout } from 'src/features/cseMachine/CseMachineLayout';

import { OverallState } from '../../application/ApplicationTypes';
import { HighlightedLines } from '../../editor/EditorTypes';
import Constants, { Links } from '../../utils/Constants';
import {
  evalEditor,
  setEditorHighlightedLinesControl,
  updateCurrentStep
} from '../../workspace/WorkspaceActions';
import { beginAlertSideContent } from '../SideContentActions';
import { getLocation } from '../SideContentHelper';
import { NonStoryWorkspaceLocation, SideContentTab, SideContentType } from '../SideContentTypes';

type State = {
  visualization: React.ReactNode;
  value: number;
  height: number;
  width: number;
  lastStep: boolean;
  stepLimitExceeded: boolean;
};

type CseMachineProps = OwnProps & StateProps & DispatchProps;

type StateProps = {
  editorWidth?: string;
  sideContentHeight?: number;
  stepsTotal: number;
  currentStep: number;
  breakpointSteps: number[];
  needCseUpdate: boolean;
};

type OwnProps = {
  workspaceLocation: NonStoryWorkspaceLocation;
};

type DispatchProps = {
  handleStepUpdate: (steps: number) => void;
  handleEditorEval: () => void;
  setEditorHighlightedLines: (
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => void;
  handleAlertSideContent: () => void;
};

const cseMachineKeyMap = {
  FIRST_STEP: 'a',
  NEXT_STEP: 'f',
  PREVIOUS_STEP: 'b',
  LAST_STEP: 'e'
};

class SideContentCseMachineBase extends React.Component<CseMachineProps, State> {
  constructor(props: CseMachineProps) {
    super(props);
    this.state = {
      visualization: null,
      value: -1,
      width: this.calculateWidth(props.editorWidth),
      height: this.calculateHeight(props.sideContentHeight),
      lastStep: false,
      stepLimitExceeded: false
    };
    CseMachine.init(
      visualization => {
        this.setState({ visualization }, () => CseAnimation.playAnimation());
        if (visualization) this.props.handleAlertSideContent();
      },
      this.state.width,
      this.state.height,
      (segments: [number, number][]) => {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        // This comment is copied over from workspace saga
        props.setEditorHighlightedLines(0, segments);
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
      CseMachine.updateDimensions(newWidth, newHeight);
    }
  }, 300);

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    CseMachine.redraw();
  }

  componentWillUnmount() {
    this.handleResize.cancel();
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps: {
    editorWidth?: string;
    sideContentHeight?: number;
    stepsTotal: number;
    needCseUpdate: boolean;
  }) {
    if (
      prevProps.sideContentHeight !== this.props.sideContentHeight ||
      prevProps.editorWidth !== this.props.editorWidth
    ) {
      this.handleResize();
    }
    if (prevProps.needCseUpdate && !this.props.needCseUpdate) {
      this.stepFirst();
      CseMachine.clearCse();
    }
  }

  public render() {
    const cseMachineHandlers = this.state.visualization
      ? {
          FIRST_STEP: this.stepFirst,
          NEXT_STEP: this.stepNext,
          PREVIOUS_STEP: this.stepPrevious,
          LAST_STEP: this.stepLast(this.props.stepsTotal)
        }
      : {
          FIRST_STEP: () => {},
          NEXT_STEP: () => {},
          PREVIOUS_STEP: () => {},
          LAST_STEP: () => {}
        };

    return (
      <HotKeys
        keyMap={cseMachineKeyMap}
        handlers={cseMachineHandlers}
        style={{
          maxHeight: '100%',
          overflow: this.state.visualization ? 'hidden' : 'auto'
        }}
      >
        <div className={classNames('sa-substituter', Classes.DARK)}>
          <Slider
            disabled={!this.state.visualization}
            min={1}
            max={this.props.stepsTotal}
            onChange={this.sliderShift}
            onRelease={this.sliderRelease}
            value={this.state.value < 1 ? 1 : this.state.value}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ButtonGroup>
              <Tooltip2 content="Control and Stash" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization && CseMachine.getCompactLayout()) {
                      CseMachine.toggleControlStash();
                      CseMachine.redraw();
                    }
                  }}
                  icon="layers"
                  disabled={!this.state.visualization || !CseMachine.getCompactLayout()}
                >
                  <Checkbox
                    checked={CseMachine.getControlStash()}
                    disabled={!CseMachine.getCompactLayout()}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip2>
              <Tooltip2 content="Truncate Control" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization && CseMachine.getControlStash()) {
                      CseMachine.toggleStackTruncated();
                      CseMachine.redraw();
                    }
                  }}
                  icon="minimize"
                  disabled={!this.state.visualization || !CseMachine.getControlStash()}
                >
                  <Checkbox
                    checked={CseMachine.getStackTruncated()}
                    disabled={!CseMachine.getControlStash()}
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
                      CseMachine.toggleCompactLayout();
                      CseMachine.redraw();
                    }
                  }}
                  icon="build"
                  disabled={!this.state.visualization}
                >
                  <Checkbox
                    checked={!CseMachine.getCompactLayout()}
                    disabled={!this.state.visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip2>
              <Tooltip2 content="Print" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization) {
                      CseMachine.togglePrintableMode();
                      CseMachine.redraw();
                    }
                  }}
                  icon="print"
                  disabled={!this.state.visualization}
                >
                  <Checkbox
                    disabled={!this.state.visualization}
                    checked={CseMachine.getPrintableMode()}
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
              id="cse-machine-default-text"
              className={Classes.RUNNING_TEXT}
              data-testid="cse-machine-default-text"
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
            id="cse-machine-default-text"
            className={Classes.RUNNING_TEXT}
            data-testid="cse-machine-default-text"
          >
            The CSE machine generates control, stash and environment model diagrams following a
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
            then dragging the slider above to see the state of the control, stash and environment at
            different stages in the evaluation of your program. Clicking on the fast-forward button
            (double chevron) will take you to the next breakpoint in your program
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
    if (newValue === this.props.stepsTotal) {
      this.setState({ lastStep: true });
    } else {
      this.setState({ lastStep: false });
    }
    this.props.handleEditorEval();
  };

  private sliderShift = (newValue: number) => {
    this.props.handleStepUpdate(newValue);
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
    const lastStepValue = this.props.stepsTotal;
    if (this.state.value !== lastStepValue) {
      this.sliderShift(this.state.value + 1);
      this.sliderRelease(this.state.value + 1);
      CseAnimation.enableAnimations();
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
    this.sliderShift(this.props.stepsTotal);
    this.sliderRelease(this.props.stepsTotal);
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
  let workspace: PlaygroundWorkspaceState;
  const [loc] = getLocation(ownProps.workspaceLocation);

  switch (loc) {
    // case 'stories': {
    //   workspace = state.stories.envs[storyEnv]
    //   break
    // }
    case 'sicp': {
      workspace = state.workspaces.sicp;
      break;
    }
    default: {
      workspace = state.workspaces.playground;
      break;
    }
  }

  return {
    ...ownProps,
    stepsTotal: workspace.stepsTotal,
    currentStep: workspace.currentStep,
    breakpointSteps: workspace.breakpointSteps,
    needCseUpdate: workspace.updateCse
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, props) =>
  bindActionCreators(
    {
      handleEditorEval: () => evalEditor(props.workspaceLocation),
      handleStepUpdate: (steps: number) => updateCurrentStep(steps, props.workspaceLocation),
      handleAlertSideContent: () =>
        beginAlertSideContent(SideContentType.cseMachine, props.workspaceLocation),
      setEditorHighlightedLines: (
        editorTabIndex: number,
        newHighlightedLines: HighlightedLines[]
      ) =>
        setEditorHighlightedLinesControl(
          props.workspaceLocation,
          editorTabIndex,
          newHighlightedLines
        )
    },
    dispatch
  );

export const SideContentCseMachine = connect(
  mapStateToProps,
  mapDispatchToProps
)(SideContentCseMachineBase);

const makeCseMachineTabFrom = (location: NonStoryWorkspaceLocation): SideContentTab => ({
  label: 'CSE Machine',
  iconName: IconNames.GLOBE,
  body: <SideContentCseMachine workspaceLocation={location} />,
  id: SideContentType.cseMachine
});

export default makeCseMachineTabFrom;
