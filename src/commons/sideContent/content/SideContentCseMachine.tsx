import {
  AnchorButton,
  Button,
  ButtonGroup,
  Checkbox,
  Classes,
  Divider,
  Slider,
  Tooltip
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { HotkeyItem } from '@mantine/hooks';
import { bindActionCreators } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { t } from 'i18next';
import { Chapter } from 'js-slang/dist/types';
import { debounce } from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import HotKeys from 'src/commons/hotkeys/HotKeys';
import { Output } from 'src/commons/repl/Repl';
import type { PlaygroundWorkspaceState } from 'src/commons/workspace/WorkspaceTypes';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { CseAnimation } from 'src/features/cseMachine/CseMachineAnimation';
import { Layout } from 'src/features/cseMachine/CseMachineLayout';
import { CseMachine as JavaCseMachine } from 'src/features/cseMachine/java/CseMachine';

import { InterpreterOutput, OverallState } from '../../application/ApplicationTypes';
import { HighlightedLines } from '../../editor/EditorTypes';
import Constants, { Links } from '../../utils/Constants';
import WorkspaceActions from '../../workspace/WorkspaceActions';
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
  chapter: Chapter;
};

type CseMachineProps = OwnProps & StateProps & DispatchProps;

type StateProps = {
  editorWidth?: string;
  sideContentHeight?: number;
  stepsTotal: number;
  currentStep: number;
  breakpointSteps: number[];
  changepointSteps: number[];
  needCseUpdate: boolean;
  machineOutput: InterpreterOutput[];
  chapter: Chapter;
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

class SideContentCseMachineBase extends React.Component<CseMachineProps, State> {
  constructor(props: CseMachineProps) {
    super(props);
    this.state = {
      visualization: null,
      value: -1,
      width: this.calculateWidth(props.editorWidth),
      height: this.calculateHeight(props.sideContentHeight),
      lastStep: false,
      stepLimitExceeded: false,
      chapter: props.chapter
    };
    if (this.isJava()) {
      JavaCseMachine.init(
        visualization => this.setState({ visualization }),
        (segments: [number, number][]) => {
          props.setEditorHighlightedLines(0, segments);
        }
      );
    } else {
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
        // We shouldn't be able to move slider to a step number beyond the step limit
        isControlEmpty => {
          this.setState({ stepLimitExceeded: false });
        }
      );
    }
  }

  private isJava(): boolean {
    return this.props.chapter === Chapter.FULL_JAVA;
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
      if (this.isJava()) {
        JavaCseMachine.clearCse();
      } else {
        CseMachine.clearCse();
      }
    }
  }

  public render() {
    const hotkeyBindings: HotkeyItem[] = this.state.visualization
      ? [
          ['a', this.stepFirst],
          ['f', this.stepNext],
          ['b', this.stepPrevious],
          ['e', this.stepLast(this.props.stepsTotal)]
        ]
      : [
          ['a', () => {}],
          ['f', () => {}],
          ['b', () => {}],
          ['e', () => {}]
        ];

    return (
      <HotKeys
        bindings={hotkeyBindings}
        style={{
          maxHeight: '100%',
          overflow: this.state.visualization ? 'hidden' : 'auto'
        }}
      >
        <div className={classNames('sa-substituter', Classes.DARK)}>
          <Slider
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
              justifyContent: this.isJava() ? 'center' : 'space-between',
              alignItems: 'center'
            }}
          >
            {!this.isJava() && (
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
              </ButtonGroup>
            )}
            <ButtonGroup>
              <Button
                disabled={!this.state.visualization}
                icon="double-chevron-left"
                onClick={this.stepPrevBreakpoint}
              />
              <Button
                disabled={!this.state.visualization}
                icon="chevron-left"
                onClick={
                  this.isJava() || CseMachine.getControlStash()
                    ? this.stepPrevious
                    : this.stepPrevChangepoint
                }
              />
              <Button
                disabled={!this.state.visualization}
                icon="chevron-right"
                onClick={
                  this.isJava() || CseMachine.getControlStash()
                    ? this.stepNext
                    : this.stepNextChangepoint
                }
              />
              <Button
                disabled={!this.state.visualization}
                icon="double-chevron-right"
                onClick={this.stepNextBreakpoint}
              />
            </ButtonGroup>
            {!this.isJava() && (
              <ButtonGroup>
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
            )}
          </div>
        </div>{' '}
        {this.state.visualization &&
        this.props.machineOutput.length &&
        this.props.machineOutput[0].type === 'errors' ? (
          this.props.machineOutput.map((slice, index) => (
            <Output output={slice} key={index} usingSubst={false} isHtml={false} />
          ))
        ) : (
          <div></div>
        )}
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
          <CseMachineDefaultText isJava={this.isJava()} />
        )}
        <ButtonGroup
          vertical={true}
          style={{ position: 'absolute', bottom: '20px', right: '20px' }}
        >
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
    if (this.isJava()) {
      JavaCseMachine.zoomStage(isZoomIn, multiplier);
    } else {
      Layout.zoomStage(isZoomIn, multiplier);
    }
  };

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
    for (const step of this.props.changepointSteps) {
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
    for (let i = this.props.changepointSteps.length - 1; i >= 0; i--) {
      const step = this.props.changepointSteps[i];
      if (step < this.state.value) {
        this.sliderShift(step);
        this.sliderRelease(step);
        return;
      }
    }
    this.sliderShift(0);
    this.sliderRelease(0);
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
    changepointSteps: workspace.changepointSteps,
    needCseUpdate: workspace.updateCse,
    machineOutput: workspace.output,
    chapter: workspace.context.chapter
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, props) =>
  bindActionCreators(
    {
      handleEditorEval: () => WorkspaceActions.evalEditor(props.workspaceLocation),
      handleStepUpdate: (steps: number) =>
        WorkspaceActions.updateCurrentStep(steps, props.workspaceLocation),
      handleAlertSideContent: () =>
        beginAlertSideContent(SideContentType.cseMachine, props.workspaceLocation),
      setEditorHighlightedLines: (
        editorTabIndex: number,
        newHighlightedLines: HighlightedLines[]
      ) =>
        WorkspaceActions.setEditorHighlightedLinesControl(
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
  label: t('sideContent:cseMachine.label'),
  iconName: IconNames.GLOBE,
  body: <SideContentCseMachine workspaceLocation={location} />,
  id: SideContentType.cseMachine
});

export const ItalicLink: React.FC<{ href: string; children?: React.ReactNode }> = ({
  href,
  children
}) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <i>{children}</i>
    </a>
  );
};

const CseMachineDefaultText: React.FC<{ isJava: boolean }> = ({ isJava }) => {
  const { t } = useTranslation('sideContent', { keyPrefix: 'cseMachine' });
  return (
    <div
      id="cse-machine-default-text"
      className={Classes.RUNNING_TEXT}
      data-testid="cse-machine-default-text"
    >
      {isJava ? (
        <span>
          <Trans
            ns="sideContent"
            i18nKey="cseMachine.csecDescription"
            components={[<ItalicLink href={Links.textbookChapter3_2} />]}
          />{' '}
          <Trans
            ns="sideContent"
            i18nKey="cseMachine.javaCsec"
            components={[<ItalicLink href={`${Links.sourceDocs}java_csec/`} />]}
          />
        </span>
      ) : (
        <span>
          <Trans
            ns="sideContent"
            i18nKey="cseMachine.cseDescription"
            components={[<ItalicLink href={Links.textbookChapter3_2} />]}
          />
        </span>
      )}
      <br />
      <br />
      {t('instructions')}
      <br />
      <br />
      <Divider />
      {t('shortcutsTitle')}
      <br />
      <br />
      {t('shortcuts.a')}
      <br />
      {t('shortcuts.e')}
      <br />
      {t('shortcuts.f')}
      <br />
      {t('shortcuts.b')}
      <br />
      <br />
      {t('shortcutsNote')}
    </div>
  );
};

export default makeCseMachineTabFrom;
