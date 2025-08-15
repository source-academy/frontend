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
import { Chapter } from 'js-slang/dist/types';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const calculateWidth = (editorWidth?: string) => {
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
};

const calculateHeight = (sideContentHeight?: number) => {
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
};

type Props = OwnProps & StateProps & DispatchProps;

const SideContentCseMachineBase: React.FC<Props> = props => {
  const [visualization, setVisualization] = useState<React.ReactNode>(null);
  const [value, setValue] = useState(-1);
  const [width, setWidth] = useState(calculateWidth(props.editorWidth));
  const [height, setHeight] = useState(calculateHeight(props.sideContentHeight));
  const [lastStep, setLastStep] = useState(false);
  const [stepLimitExceeded, setStepLimitExceeded] = useState(false);

  const isJava = useCallback(() => props.chapter === Chapter.FULL_JAVA, [props.chapter]);

  const handleResize = useCallback(
    debounce(() => {
      const newWidth = calculateWidth(props.editorWidth);
      const newHeight = calculateHeight(props.sideContentHeight);
      if (newWidth !== width || newHeight !== height) {
        setWidth(newWidth);
        setHeight(newHeight);
        CseMachine.updateDimensions(newWidth, newHeight);
      }
    }, 300),
    [props.editorWidth, props.sideContentHeight, width, height]
  );

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    CseMachine.redraw();

    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // TODO: STOPPED CHECKING HERE

  useEffect(() => {
    if (isJava()) {
      JavaCseMachine.init(setVisualization, (segments: [number, number][]) => {
        props.setEditorHighlightedLines(0, segments);
      });
    } else {
      CseMachine.init(
        visualization => {
          setVisualization(visualization);
          CseAnimation.playAnimation();
          if (visualization) props.handleAlertSideContent();
        },
        width,
        height,
        (segments: [number, number][]) => {
          props.setEditorHighlightedLines(0, segments);
        },
        () => setStepLimitExceeded(false)
      );
    }
  }, [isJava, props, width, height]);

  useEffect(() => {
    if (props.needCseUpdate) {
      stepFirst();
      if (isJava()) {
        JavaCseMachine.clearCse();
      } else {
        CseMachine.clearCse();
      }
    }
  }, [props.needCseUpdate, isJava]);

  const sliderRelease = useCallback(
    (newValue: number) => {
      setLastStep(newValue === props.stepsTotal);
      props.handleEditorEval();
    },
    [props]
  );

  const sliderShift = useCallback(
    (newValue: number) => {
      props.handleStepUpdate(newValue);
      setValue(newValue);
    },
    [props]
  );

  const stepPrevious = useCallback(() => {
    if (value !== 0) {
      sliderShift(value - 1);
      sliderRelease(value - 1);
    }
  }, [value, sliderShift, sliderRelease]);

  const stepNext = useCallback(() => {
    const lastStepValue = props.stepsTotal;
    if (value !== lastStepValue) {
      sliderShift(value + 1);
      sliderRelease(value + 1);
      CseAnimation.enableAnimations();
    }
  }, [value, props.stepsTotal, sliderShift, sliderRelease]);

  const stepFirst = useCallback(() => {
    // Move to the first step
    sliderShift(0);
    sliderRelease(0);
  }, [sliderShift, sliderRelease]);

  const stepLast = useCallback(
    (lastStepValue: number) => {
      // Move to the last step
      sliderShift(lastStepValue);
      sliderRelease(lastStepValue);
    },
    [sliderShift, sliderRelease]
  );

  const stepNextBreakpoint = useCallback(() => {
    for (const step of props.breakpointSteps) {
      if (step > value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(props.stepsTotal);
    sliderRelease(props.stepsTotal);
  }, [props.breakpointSteps, props.stepsTotal, value, sliderShift, sliderRelease]);

  const stepPrevBreakpoint = useCallback(() => {
    for (let i = props.breakpointSteps.length - 1; i >= 0; i--) {
      const step = props.breakpointSteps[i];
      if (step < value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(0);
    sliderRelease(0);
  }, [props.breakpointSteps, value, sliderShift, sliderRelease]);

  const stepNextChangepoint = useCallback(() => {
    for (const step of props.changepointSteps) {
      if (step > value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(props.stepsTotal);
    sliderRelease(props.stepsTotal);
  }, [props.changepointSteps, props.stepsTotal, value, sliderShift, sliderRelease]);

  const stepPrevChangepoint = useCallback(() => {
    for (let i = props.changepointSteps.length - 1; i >= 0; i--) {
      const step = props.changepointSteps[i];
      if (step < value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(0);
    sliderRelease(0);
  }, [props.changepointSteps, value, sliderShift, sliderRelease]);

  const zoomStage = useCallback(
    (isZoomIn: boolean, multiplier: number) => {
      if (isJava()) {
        JavaCseMachine.zoomStage(isZoomIn, multiplier);
      } else {
        Layout.zoomStage(isZoomIn, multiplier);
      }
    },
    [isJava]
  );

  const hotkeyBindings: HotkeyItem[] = useMemo(
    () =>
      visualization
        ? [
            ['a', stepFirst],
            ['f', stepNext],
            ['b', stepPrevious],
            ['e', () => stepLast(props.stepsTotal)]
          ]
        : [
            ['a', () => {}],
            ['f', () => {}],
            ['b', () => {}],
            ['e', () => {}]
          ],
    [visualization, stepFirst, stepNext, stepPrevious, props.stepsTotal, stepLast]
  );

  return (
    <HotKeys
      bindings={hotkeyBindings}
      style={{
        maxHeight: '100%',
        overflow: visualization ? 'hidden' : 'auto'
      }}
    >
      <div className={classNames('sa-substituter', Classes.DARK)}>
        <Slider
          disabled={!visualization}
          min={0}
          max={props.stepsTotal}
          onChange={sliderShift}
          onRelease={sliderRelease}
          value={value < 0 ? 0 : value}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: isJava() ? 'center' : 'space-between',
            alignItems: 'center'
          }}
        >
          {!isJava() && (
            <ButtonGroup>
              <Tooltip content="Control and Stash" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (visualization) {
                      CseMachine.toggleControlStash();
                      CseMachine.redraw();
                    }
                  }}
                  icon="layers"
                  disabled={!visualization}
                >
                  <Checkbox
                    checked={CseMachine.getControlStash()}
                    disabled={!visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip content="Truncate Control" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (visualization) {
                      CseMachine.toggleStackTruncated();
                      CseMachine.redraw();
                    }
                  }}
                  icon="minimize"
                  disabled={!visualization}
                >
                  <Checkbox
                    checked={CseMachine.getStackTruncated()}
                    disabled={!visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip>
            </ButtonGroup>
          )}
          <ButtonGroup>
            <Button
              disabled={!visualization}
              icon="double-chevron-left"
              onClick={stepPrevBreakpoint}
            />
            <Button
              disabled={!visualization}
              icon="chevron-left"
              onClick={
                isJava() || CseMachine.getControlStash() ? stepPrevious : stepPrevChangepoint
              }
            />
            <Button
              disabled={!visualization}
              icon="chevron-right"
              onClick={isJava() || CseMachine.getControlStash() ? stepNext : stepNextChangepoint}
            />
            <Button
              disabled={!visualization}
              icon="double-chevron-right"
              onClick={stepNextBreakpoint}
            />
          </ButtonGroup>
          {!isJava() && (
            <ButtonGroup>
              <Tooltip content="Print" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (visualization) {
                      CseMachine.togglePrintableMode();
                      CseMachine.redraw();
                    }
                  }}
                  icon="print"
                  disabled={!visualization}
                >
                  <Checkbox
                    disabled={!visualization}
                    checked={CseMachine.getPrintableMode()}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip content="Save" compact>
                <AnchorButton
                  icon="floppy-disk"
                  disabled={!visualization}
                  onClick={Layout.exportImage}
                />
              </Tooltip>
            </ButtonGroup>
          )}
        </div>
      </div>
      {visualization && props.machineOutput.length && props.machineOutput[0].type === 'errors' ? (
        props.machineOutput.map((slice, index) => (
          <Output output={slice} key={index} usingSubst={false} isHtml={false} />
        ))
      ) : (
        <div></div>
      )}
      {visualization ? (
        stepLimitExceeded ? (
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
          visualization
        )
      ) : (
        <div
          id="cse-machine-default-text"
          className={Classes.RUNNING_TEXT}
          data-testid="cse-machine-default-text"
        >
          {isJava() ? (
            <span>
              The CSEC machine generates control, stash, environment and class model diagrams
              adapted from the notation introduced in{' '}
              <a href={Links.textbookChapter3_2} rel="noopener noreferrer" target="_blank">
                <i>
                  Structure and Interpretation of Computer Programs, JavaScript Edition, Chapter 3,
                  Section 2
                </i>
              </a>
              {'. '}
              You have chosen the sublanguage{' '}
              <a href={`${Links.sourceDocs}java_csec/`} rel="noopener noreferrer" target="_blank">
                <i>Java CSEC</i>
              </a>
            </span>
          ) : (
            <span>
              The CSE machine generates control, stash and environment model diagrams following a
              notation introduced in{' '}
              <a href={Links.textbookChapter3_2} rel="noopener noreferrer" target="_blank">
                <i>
                  Structure and Interpretation of Computer Programs, JavaScript Edition, Chapter 3,
                  Section 2
                </i>
              </a>
            </span>
          )}
          .
          <br />
          <br /> On this tab, the REPL will be hidden from view, so do check that your code has no
          errors before running the stepper. You may use this tool by running your program and then
          dragging the slider above to see the state of the control, stash and environment at
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
      <ButtonGroup vertical={true} style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
        <Button
          icon="plus"
          disabled={!visualization}
          onClick={() => zoomStage(true, 5)}
          style={{ marginBottom: '5px', borderRadius: '3px' }}
        />
        <Button
          icon="minus"
          disabled={!visualization}
          onClick={() => zoomStage(false, 5)}
          style={{ borderRadius: '3px' }}
        />
      </ButtonGroup>
    </HotKeys>
  );
};

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
  label: 'CSE Machine',
  iconName: IconNames.GLOBE,
  body: <SideContentCseMachine workspaceLocation={location} />,
  id: SideContentType.cseMachine
});

export default makeCseMachineTabFrom;
