import {
  AnchorButton,
  Button,
  ButtonGroup,
  Checkbox,
  Classes,
  Divider,
  Popover,
  Position,
  Slider,
  Tooltip,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import type { HotkeyItem } from '@mantine/hooks';
import { bindActionCreators } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { Chapter } from 'js-slang/dist/langs';
import { debounce } from 'lodash-es';
import { Component } from 'react';
import { connect, type MapDispatchToProps, type MapStateToProps } from 'react-redux';
import HotKeys from 'src/commons/hotkeys/HotKeys';
import { Output } from 'src/commons/repl/Repl';
import {
  type PlaygroundWorkspaceState,
  type WorkspaceLocation,
} from 'src/commons/workspace/WorkspaceTypes';
import { ClearDeadFramesAnimation } from 'src/features/cseMachine/animationComponents/ClearDeadFramesAnimation';
import { continuesRun } from 'src/features/cseMachine/continuesRun';
import CseArrowFilterMenu from 'src/features/cseMachine/CseArrowFilterMenu';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { CseAnimation } from 'src/features/cseMachine/CseMachineAnimation';
import { Layout } from 'src/features/cseMachine/CseMachineLayout';
import { computeFramesCoordChange } from 'src/features/cseMachine/CseMachineUtils';
import {
  snapshotWithAllFrames,
  snapshotWithDeadFrames,
} from 'src/features/cseMachine/cseSnapshotHistory';
import { fullscreenPortalContainer } from 'src/features/cseMachine/fullscreenPortalContainer';

import type { CseSnapshot } from '../../../features/conductor/CseMachineHostPlugin';
import type { InterpreterOutput, OverallState } from '../../application/ApplicationTypes';
import type { HighlightedLines } from '../../editor/EditorTypes';
import Constants, { Links } from '../../utils/Constants';
import WorkspaceActions from '../../workspace/WorkspaceActions';
import { alertSideContent } from '../SideContentActions';
import { getLocation } from '../SideContentHelper';
import { type SideContentTab, SideContentType } from '../SideContentTypes';

type State = {
  visualization: React.ReactNode;
  value: number;
  height: number;
  width: number;
  lastStep: boolean;
  /** Whether the steps end before the program has finished (it was stopped, or ran for more steps
   * than are recorded): the drawing is at the last step and the control still has items. */
  endsUnfinished: boolean;
  chapter: Chapter;
  clearDeadFrames: boolean;
  arrowFilterOpen: boolean;
  sliderKey: number;
};

type CseMachineProps = OwnProps & StateProps & DispatchProps;

type StateProps = {
  editorWidth?: string;
  sideContentHeight?: number;
  stepsTotal: number;
  currentStep: number;
  breakpointSteps: number[];
  changepointSteps: number[];
  machineOutput: InterpreterOutput[];
  chapter: Chapter;
  cseSnapshots: CseSnapshot[] | null;
  isOnCseTab: boolean;
};

type OwnProps = {
  workspaceLocation: WorkspaceLocation;
};

type DispatchProps = {
  handleStepUpdate: (steps: number) => void;
  handleStepsTotalUpdate: (steps: number) => void;
  handleEditorEval: () => void;
  setEditorHighlightedLines: (
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[],
  ) => void;
  setEditorHighlightedLinesStep: (
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[],
  ) => void;
  handleAlertSideContent: () => void;
  doUpdateCseSnapshots: (snapshots: CseSnapshot[] | null) => void;
};

class SideContentCseMachineBase extends Component<CseMachineProps, State> {
  private greenScreenObserver?: MutationObserver;

  constructor(props: CseMachineProps) {
    super(props);
    this.state = {
      visualization: null,
      value: -1,
      width: this.calculateWidth(props.editorWidth),
      height: this.calculateHeight(props.sideContentHeight),
      lastStep: false,
      endsUnfinished: false,
      chapter: props.chapter,
      clearDeadFrames: false,
      arrowFilterOpen: false,
      sliderKey: 0,
    };
    CseMachine.init(
      visualization => {
        this.setState({ visualization }, () => CseAnimation.playAnimation());
        if (visualization) {
          this.props.handleAlertSideContent();
        }
      },
      this.state.width,
      this.state.height,
      (segments: [number, number][]) => {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        // This comment is copied over from workspace saga
        props.setEditorHighlightedLines(0, segments);
      },
      // At the last step with items still on the control, the program did not finish: the steps end
      // here.
      isControlEmpty => {
        const isAtLastStep = this.state.value === this.props.stepsTotal;

        this.setState({
          endsUnfinished: !isControlEmpty && isAtLastStep,
        });
      },
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
        (window.innerWidth * (100 - parseFloat(editorWidth))) / 100 - horizontalPadding,
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
        width: newWidth,
      });
      CseMachine.updateDimensions(newWidth, newHeight);
    }
  }, 300);

  private handleFullscreenChange = () => {
    // Double rAF ensures the browser has completed layout after the fullscreen
    // transition before Blueprint Slider remounts and measures its track width.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setState(prev => ({ sliderKey: prev.sliderKey + 1 }));
      });
    });
  };

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    // The diagram's colours follow the Playground's green-screen mode, so redraw when it toggles.
    const playground = document.querySelector('.Playground');
    if (playground) {
      this.greenScreenObserver = new MutationObserver(() => {
        CseMachine.clearCachedLayouts();
        window.requestAnimationFrame(() => CseMachine.redraw());
      });
      this.greenScreenObserver.observe(playground, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
    if (this.props.cseSnapshots) {
      this.renderSnapshotAt(0);
    } else {
      CseMachine.redraw();
    }
  }

  componentWillUnmount() {
    this.handleResize.cancel();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    this.greenScreenObserver?.disconnect();
    CseMachine.resetArrowOriginFilters();
    this.clearView();
  }

  /**
   * The tab owns the state it puts on the workspace: the drawing, the step counters and the editor
   * highlights. It stays mounted while another tab is shown, so this runs whenever the tab stops
   * being active or its snapshots go away, not only on unmount.
   */
  private clearView() {
    CseMachine.clearCse();
    this.props.handleStepUpdate(-1);
    this.props.handleStepsTotalUpdate(0);
    this.props.setEditorHighlightedLines(0, []);
    this.props.setEditorHighlightedLinesStep(0, []);
  }

  componentDidUpdate(prevProps: {
    editorWidth?: string;
    sideContentHeight?: number;
    stepsTotal: number;
    isOnCseTab: boolean;
    cseSnapshots: CseSnapshot[] | null;
  }) {
    if (
      prevProps.sideContentHeight !== this.props.sideContentHeight ||
      prevProps.editorWidth !== this.props.editorWidth
    ) {
      this.handleResize();
    }

    const { isOnCseTab, cseSnapshots } = this.props;

    // Snapshot mode: new snapshots arrived while not on the CSE tab — discard them
    if (!isOnCseTab && cseSnapshots !== null && prevProps.cseSnapshots !== cseSnapshots) {
      this.props.doUpdateCseSnapshots(null);
      return;
    }

    // Snapshot mode: user navigated away from CSE tab — clear visualization
    if (prevProps.isOnCseTab && !isOnCseTab) {
      this.setState({ visualization: null, value: -1 });
      this.clearView();
      if (cseSnapshots) {
        this.props.doUpdateCseSnapshots(null);
      }
      return;
    }

    // The snapshots went away while the tab is shown (a run that produced none): clear the view
    // rather than leave the previous run's diagram and step controls active.
    if (isOnCseTab && prevProps.cseSnapshots !== null && cseSnapshots === null) {
      this.setState({ visualization: null, value: -1 });
      this.clearView();
      return;
    }

    // The run that is going on has more snapshots: keep the user's place (and the slider as it is).
    // The frames are laid out with all of the run's frames, so the layouts of the steps may change
    // with a frame that is new: they are laid out again, and the step being shown is drawn again.
    if (
      cseSnapshots !== null &&
      prevProps.cseSnapshots !== cseSnapshots &&
      continuesRun(prevProps.cseSnapshots, cseSnapshots)
    ) {
      CseMachine.clearCachedLayouts();
      if (this.state.value >= 0) {
        this.renderSnapshotAt(this.state.value);
      }
      return;
    }

    // A new run's snapshots arrived: start over from the first step.
    if (cseSnapshots !== null && prevProps.cseSnapshots !== cseSnapshots) {
      CseMachine.clearCachedLayouts();
      CseMachine.setClearDeadFrames(false);
      this.setState({ arrowFilterOpen: false });
      this.stepFirst();

      // Blueprint Slider caches its track width at mount. After a code run the
      // tab is guaranteed visible, so force it to remount and re-measure.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.setState(prev => ({ sliderKey: prev.sliderKey + 1 }));
        });
      });
    }
  }

  /** Renders the conductor CSE snapshot at the given step index. */
  private renderSnapshotAt(step: number) {
    const { cseSnapshots } = this.props;
    if (!cseSnapshots) {
      return;
    }
    const snapshot = cseSnapshots[step];
    if (!snapshot) {
      return;
    }

    this.props.setEditorHighlightedLines(0, []);

    CseMachine.clearLiveLayouts();
    // Laid out with all the run's frames, the frames keep their places from step to step.
    CseMachine.renderSnapshot(
      snapshotWithDeadFrames(cseSnapshots, step),
      snapshotWithAllFrames(cseSnapshots),
    );

    this.props.setEditorHighlightedLinesStep(0, []);
    if (snapshot.currentLine !== undefined && snapshot.currentLine > 0) {
      const row = snapshot.currentLine - 1;
      this.props.setEditorHighlightedLinesStep(0, [[row, row]]);
    }
  }

  /** Returns changepoint steps. In snapshot mode, computed from environment diffs. */
  private getChangepointSteps(): number[] {
    const { cseSnapshots, changepointSteps } = this.props;
    if (cseSnapshots) {
      const steps: number[] = [];
      let prevFp: string | null = null;
      for (let i = 0; i < cseSnapshots.length; i++) {
        const fp = JSON.stringify(cseSnapshots[i]?.environments ?? []);
        if (prevFp === null || fp !== prevFp) {
          steps.push(i);
        }
        prevFp = fp;
      }
      return steps;
    }
    return changepointSteps;
  }

  public render() {
    const hotkeyBindings: HotkeyItem[] = this.state.visualization
      ? [
          ['a', this.stepFirst],
          ['f', this.stepNext],
          ['b', this.stepPrevious],
          ['e', this.stepLast(this.props.stepsTotal)],
        ]
      : [
          ['a', () => {}],
          ['f', () => {}],
          ['b', () => {}],
          ['e', () => {}],
        ];

    const currentStep = Math.max(0, this.state.value);
    const isAtFirstStep = currentStep < 1;
    const isAtLastStep = currentStep >= this.props.stepsTotal;
    const isNavDisabled = !this.state.visualization;

    return (
      <HotKeys
        bindings={hotkeyBindings}
        style={{
          maxHeight: '100%',
          overflow: this.state.visualization ? 'hidden' : 'auto',
        }}
      >
        <div className={classNames('sa-substituter', Classes.DARK)}>
          <Slider
            key={this.state.sliderKey}
            disabled={!this.state.visualization}
            min={0}
            max={this.props.stepsTotal}
            onChange={this.sliderShift}
            onRelease={this.sliderRelease}
            value={this.state.value < 0 ? 0 : this.state.value}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ButtonGroup>
              <Tooltip content="Control and Stash" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization) {
                      CseMachine.toggleControlStash();
                      CseMachine.redraw();
                    }
                  }}
                  icon="layers"
                  disabled={!this.state.visualization}
                >
                  <Checkbox
                    checked={CseMachine.getControlStash()}
                    disabled={!this.state.visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip content="Truncate Control" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization) {
                      CseMachine.toggleStackTruncated();
                      CseMachine.redraw();
                    }
                  }}
                  icon="minimize"
                  disabled={!this.state.visualization}
                >
                  <Checkbox
                    checked={CseMachine.getStackTruncated()}
                    disabled={!this.state.visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip>

              <Tooltip content="Alignment" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization) {
                      CseMachine.toggleCenterAlignment();
                      CseMachine.redraw();
                    }
                  }}
                  icon="eye-open"
                  disabled={!this.state.visualization}
                >
                  <Checkbox
                    checked={CseMachine.getCenterAlignment()}
                    disabled={!this.state.visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip
                content="Filter Arrows"
                compact
                portalContainer={fullscreenPortalContainer()}
              >
                <Popover
                  portalContainer={fullscreenPortalContainer()}
                  isOpen={this.state.arrowFilterOpen}
                  onInteraction={nextOpen => this.setState({ arrowFilterOpen: nextOpen })}
                  position={Position.BOTTOM_LEFT}
                  content={<CseArrowFilterMenu onChange={this.refreshArrowFilters} />}
                >
                  <AnchorButton icon="flow-branch" disabled={!this.state.visualization} />
                </Popover>
              </Tooltip>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                disabled={isNavDisabled || isAtFirstStep}
                icon="double-chevron-left"
                onClick={this.stepPrevBreakpoint}
              />
              <Button
                disabled={isNavDisabled || isAtFirstStep}
                icon="chevron-left"
                onClick={
                  CseMachine.getControlStash() ? this.stepPrevious : this.stepPrevChangepoint
                }
              />
              <Button
                disabled={isNavDisabled || isAtLastStep}
                icon="chevron-right"
                onClick={CseMachine.getControlStash() ? this.stepNext : this.stepNextChangepoint}
              />
              <Button
                disabled={isNavDisabled || isAtLastStep}
                icon="double-chevron-right"
                onClick={this.stepNextBreakpoint}
              />
            </ButtonGroup>

            <ButtonGroup>
              <Tooltip content="Clear Unreachable Objects" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (this.state.visualization) {
                      const prevLevels = Layout.levels;
                      this.setState(
                        prevState => ({
                          clearDeadFrames: true,
                        }),
                        () => {
                          CseMachine.setClearDeadFrames(this.state.clearDeadFrames);
                          CseMachine.clearLiveLayouts();

                          // Temporarily store the original draw function
                          const originalDraw = Layout.draw;

                          // Overriding because the animations are causing
                          // Konva objects to not be drawn
                          Layout.draw = () => {
                            try {
                              const currLevels = Layout.levels;
                              const changedFramePairs = computeFramesCoordChange(
                                prevLevels,
                                currLevels,
                              );
                              if (changedFramePairs.length > 0) {
                                CseAnimation.animations.push(
                                  new ClearDeadFramesAnimation(changedFramePairs),
                                );
                                CseAnimation.enableAnimations();
                              }

                              return originalDraw.apply(Layout);
                            } finally {
                              Layout.draw = originalDraw;
                            }
                          };
                          CseMachine.redraw();
                        },
                      );
                    }
                  }}
                  icon="eraser"
                  disabled={this.state.clearDeadFrames || !this.state.visualization}
                />
              </Tooltip>
              <Tooltip content="Print" compact>
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
              </Tooltip>
              <Tooltip content="Save" compact>
                <AnchorButton
                  icon="floppy-disk"
                  disabled={!this.state.visualization}
                  onClick={Layout.exportImage}
                />
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>{' '}
        {this.state.visualization &&
        this.props.machineOutput.length &&
        this.props.machineOutput[0].type === 'errors' ? (
          this.props.machineOutput.map((slice, index) => (
            <Output output={slice} key={index} usingSubst={false} />
          ))
        ) : (
          <div />
        )}
        {this.state.visualization ? (
          this.state.endsUnfinished ? (
            <div
              id="cse-machine-default-text"
              className={Classes.RUNNING_TEXT}
              data-testid="cse-machine-default-text"
            >
              The steps end here, before the program finished.
              <Divider />
              The run was stopped, or has more steps than the CSE machine records.
            </div>
          ) : (
            this.state.visualization
          )
        ) : (
          <CseMachineDefaultText />
        )}
        <ButtonGroup vertical style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
          <Button
            icon="plus"
            disabled={!this.state.visualization}
            onClick={() => this.zoomStage(true, 5)}
            style={{ marginBottom: '5px', borderRadius: '3px' }}
          />
          <Button
            icon="minus"
            disabled={!this.state.visualization}
            onClick={() => this.zoomStage(false, 5)}
            style={{ borderRadius: '3px' }}
          />
        </ButtonGroup>
      </HotKeys>
    );
  }

  private zoomStage = (isZoomIn: boolean, multiplier: number) => {
    Layout.zoomStage(isZoomIn, multiplier);
  };

  private sliderRelease = (newValue: number) => {
    if (this.props.cseSnapshots) {
      this.renderSnapshotAt(newValue);
      return;
    }
    if (newValue === this.props.stepsTotal) {
      this.setState({ lastStep: true });
    } else {
      this.setState({ lastStep: false });
    }
    this.props.handleEditorEval();
  };

  private sliderShift = (newValue: number) => {
    if (this.state.clearDeadFrames) {
      CseMachine.setClearDeadFrames(false);
      CseMachine.clearLiveLayouts();
      if (!this.props.cseSnapshots) {
        CseMachine.redraw();
      }
    }
    this.props.handleStepUpdate(newValue);
    this.setState((state: State) => {
      return { value: newValue, clearDeadFrames: false };
    });
  };

  private stepPrevious = () => {
    if (this.state.value !== 0) {
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
    this.sliderShift(0);
    this.sliderRelease(0);
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
    this.sliderShift(0);
    this.sliderRelease(0);
  };

  private stepNextChangepoint = () => {
    for (const step of this.getChangepointSteps()) {
      if (step > this.state.value) {
        this.sliderShift(step);
        this.sliderRelease(step);
        return;
      }
    }
    this.sliderShift(this.props.stepsTotal);
    this.sliderRelease(this.props.stepsTotal);
  };

  private stepPrevChangepoint = () => {
    const changeSteps = this.getChangepointSteps();
    for (let i = changeSteps.length - 1; i >= 0; i--) {
      const step = changeSteps[i];
      if (step < this.state.value) {
        this.sliderShift(step);
        this.sliderRelease(step);
        return;
      }
    }
    this.sliderShift(0);
    this.sliderRelease(0);
  };

  private refreshArrowFilters = () => {
    CseMachine.clearRenderedLayouts();
    if (this.props.cseSnapshots) {
      this.renderSnapshotAt(this.state.value);
    } else {
      CseMachine.redraw();
    }
    this.forceUpdate();
  };
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (
  state: OverallState,
  ownProps: OwnProps,
) => {
  let workspace: PlaygroundWorkspaceState;
  const [loc] = getLocation(ownProps.workspaceLocation);

  switch (loc) {
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
    changepointSteps: workspace.changepointSteps,
    machineOutput: workspace.output,
    // The CSE machine formats values identically for every chapter that has it.
    chapter: Chapter.SOURCE_4,
    cseSnapshots: workspace.cseSnapshots,
    isOnCseTab: state.sideContent[loc]?.selectedTab === SideContentType.cseMachine,
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, props) =>
  bindActionCreators(
    {
      handleEditorEval: () => WorkspaceActions.evalEditor(props.workspaceLocation),
      handleStepUpdate: (steps: number) =>
        WorkspaceActions.updateCurrentStep(steps, props.workspaceLocation),
      handleStepsTotalUpdate: (steps: number) =>
        WorkspaceActions.updateStepsTotal(steps, props.workspaceLocation),
      handleAlertSideContent: () =>
        alertSideContent(SideContentType.cseMachine, props.workspaceLocation),
      setEditorHighlightedLines: (
        editorTabIndex: number,
        newHighlightedLines: HighlightedLines[],
      ) =>
        WorkspaceActions.setEditorHighlightedLinesControl(
          props.workspaceLocation,
          editorTabIndex,
          newHighlightedLines,
        ),
      setEditorHighlightedLinesStep: (
        editorTabIndex: number,
        newHighlightedLines: HighlightedLines[],
      ) =>
        WorkspaceActions.setEditorHighlightedLines(
          props.workspaceLocation,
          editorTabIndex,
          newHighlightedLines,
        ),
      doUpdateCseSnapshots: (snapshots: CseSnapshot[] | null) =>
        WorkspaceActions.updateCseSnapshots(snapshots, props.workspaceLocation),
    },
    dispatch,
  );

export const SideContentCseMachine = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SideContentCseMachineBase);

const makeCseMachineTabFrom = (location: WorkspaceLocation): SideContentTab => ({
  label: 'CSE Machine',
  iconName: IconNames.GLOBE,
  body: <SideContentCseMachine workspaceLocation={location} />,
  id: SideContentType.cseMachine,
});

export function ItalicLink({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <i>{children}</i>
    </a>
  );
}

function CseMachineDefaultText() {
  return (
    <div
      id="cse-machine-default-text"
      className={Classes.RUNNING_TEXT}
      data-testid="cse-machine-default-text"
    >
      <span>
        The CSE machine generates control, stash and environment model diagrams following a notation
        introduced in{' '}
        <ItalicLink href={Links.textbookChapter3_2}>
          Structure and Interpretation of Computer Programs, JavaScript Edition, Chapter 3, Section
          2
        </ItalicLink>
        .
      </span>
      <br />
      <br />
      {
        'On this tab, the REPL will be hidden from view, so do check that your code has no errors before running the stepper. You may use this tool by running your program and then dragging the slider above to see the state of the control, stash and environment at different stages in the evaluation of your program. Clicking on the fast-forward button (double chevron) will take you to the next breakpoint in your program.'
      }
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
  );
}

export default makeCseMachineTabFrom;
