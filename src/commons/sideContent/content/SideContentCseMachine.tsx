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
import classNames from 'classnames';
import { t } from 'i18next';
import { Chapter } from 'js-slang/dist/langs';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import HotKeys from 'src/commons/hotkeys/HotKeys';
import { Output } from 'src/commons/repl/Repl';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import type { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import { ClearDeadFramesAnimation } from 'src/features/cseMachine/animationComponents/ClearDeadFramesAnimation';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { CseAnimation } from 'src/features/cseMachine/CseMachineAnimation';
import { Layout } from 'src/features/cseMachine/CseMachineLayout';
import type { ArrowOriginFilterKey } from 'src/features/cseMachine/CseMachineTypes';
import { computeFramesCoordChange } from 'src/features/cseMachine/CseMachineUtils';
import { CseMachine as JavaCseMachine } from 'src/features/cseMachine/java/CseMachine';

import type { HighlightedLines } from '../../editor/EditorTypes';
import Constants, { Links } from '../../utils/Constants';
import WorkspaceActions from '../../workspace/WorkspaceActions';
import { beginAlertSideContent } from '../SideContentActions';
import { getLocation } from '../SideContentHelper';
import { type SideContentTab, SideContentType } from '../SideContentTypes';

const ALL_ARROW_FILTER_KEYS: ArrowOriginFilterKey[] = [
  'text',
  'frame',
  'function',
  'array',
  'control',
  'stash',
];

type Props = {
  workspaceLocation: WorkspaceLocation;
  editorWidth?: string;
  sideContentHeight?: number;
};

const SideContentCseMachine: React.FC<Props> = ({
  workspaceLocation,
  editorWidth,
  sideContentHeight,
}) => {
  const [visualization, setVisualization] = useState<React.ReactNode>(null);
  const [value, setValue] = useState(-1);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [, setLastStep] = useState(false);
  const [stepLimitExceeded, setStepLimitExceeded] = useState(false);
  const [clearDeadFrames, setClearDeadFrames] = useState(false);
  const [arrowFilterOpen, setArrowFilterOpen] = useState(false);

  const [loc] = getLocation(workspaceLocation);
  const workspace = useTypedSelector(
    store => store.workspaces[loc === 'sicp' ? 'sicp' : 'playground'],
  );

  const dispatch = useDispatch();

  const chapter = workspace.context.chapter;
  const stepsTotal = workspace.stepsTotal;
  const breakpointSteps = workspace.breakpointSteps;
  const changepointSteps = workspace.changepointSteps;
  const updateCse = workspace.updateCse;
  const machineOutput = workspace.output;

  const isJava = chapter === Chapter.FULL_JAVA;

  const handleEditorEval = useCallback(() => {
    dispatch(WorkspaceActions.evalEditor(workspaceLocation));
  }, [dispatch, workspaceLocation]);

  const handleStepUpdate = useCallback(
    (steps: number) => {
      dispatch(WorkspaceActions.updateCurrentStep(steps, workspaceLocation));
    },
    [dispatch, workspaceLocation],
  );

  const handleAlertSideContent = useCallback(() => {
    dispatch(beginAlertSideContent(SideContentType.cseMachine, workspaceLocation));
  }, [dispatch, workspaceLocation]);

  const setEditorHighlightedLines = useCallback(
    (editorTabIndex: number, newHighlightedLines: HighlightedLines[]) => {
      dispatch(
        WorkspaceActions.setEditorHighlightedLinesControl(
          workspaceLocation,
          editorTabIndex,
          newHighlightedLines,
        ),
      );
    },
    [dispatch, workspaceLocation],
  );

  const calculateWidth = useCallback((editorWidthProp?: string) => {
    const horizontalPadding = 50;
    const maxWidth = 5000;
    let w;
    if (editorWidthProp === undefined) {
      w = window.innerWidth - horizontalPadding;
    } else {
      w = Math.min(
        maxWidth,
        (window.innerWidth * (100 - parseFloat(editorWidthProp))) / 100 - horizontalPadding,
      );
    }
    return Math.min(w, maxWidth);
  }, []);

  const calculateHeight = useCallback((sideContentHeightProp?: number) => {
    const verticalPadding = 150;
    const maxHeight = 5000; // limit for visible diagram height for huge screens
    let h;
    if (window.innerWidth < Constants.mobileBreakpoint) {
      // mobile mode
      h = window.innerHeight - verticalPadding;
    } else if (sideContentHeightProp === undefined) {
      h = window.innerHeight - verticalPadding;
    } else {
      h = sideContentHeightProp - verticalPadding;
    }
    return Math.min(h, maxHeight);
  }, []);

  const sliderRelease = useCallback(
    (newValue: number) => {
      if (newValue === stepsTotal) {
        setLastStep(true);
      } else {
        setLastStep(false);
      }
      handleEditorEval();
    },
    [stepsTotal, handleEditorEval],
  );

  const sliderShift = useCallback(
    (newValue: number) => {
      if (clearDeadFrames) {
        CseMachine.setClearDeadFrames(false);
        CseMachine.clearLiveLayouts();
        CseMachine.redraw();
      }
      handleStepUpdate(newValue);
      setValue(newValue);
      setClearDeadFrames(false);
    },
    [clearDeadFrames, handleStepUpdate],
  );

  useEffect(() => {
    const newWidth = calculateWidth(editorWidth);
    const newHeight = calculateHeight(sideContentHeight);
    if (newWidth !== width || newHeight !== height) {
      setWidth(newWidth);
      setHeight(newHeight);
      CseMachine.updateDimensions(newWidth, newHeight);
    }
  }, [calculateWidth, calculateHeight, editorWidth, sideContentHeight, width, height]);

  useEffect(() => {
    const newWidth = calculateWidth(editorWidth);
    const newHeight = calculateHeight(sideContentHeight);
    setWidth(newWidth);
    setHeight(newHeight);

    const resizeHandler = debounce(() => {
      const w = calculateWidth(editorWidth);
      const h = calculateHeight(sideContentHeight);
      if (w !== width || h !== height) {
        setWidth(w);
        setHeight(h);
        CseMachine.updateDimensions(w, h);
      }
    }, 300);

    window.addEventListener('resize', resizeHandler);
    CseMachine.redraw();

    return () => {
      resizeHandler.cancel();
      window.removeEventListener('resize', resizeHandler);
    };
  }, [calculateWidth, calculateHeight, editorWidth, sideContentHeight, width, height]);

  useEffect(() => {
    if (isJava) {
      JavaCseMachine.init(
        visualization => setVisualization(visualization),
        (segments: [number, number][]) => {
          setEditorHighlightedLines(0, segments);
        },
      );
    } else {
      CseMachine.init(
        visualization => {
          setVisualization(visualization);
          if (visualization) {
            handleAlertSideContent();
          }
          CseAnimation.playAnimation();
        },
        width,
        height,
        (segments: [number, number][]) => {
          // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
          // This comment is copied over from workspace saga
          setEditorHighlightedLines(0, segments);
        },
        // We shouldn't be able to move slider to a step number beyond the step limit
        isControlEmpty => {
          const isAtLastStep = value === stepsTotal;
          setStepLimitExceeded(!isControlEmpty && isAtLastStep);
        },
      );
    }
  }, [isJava, width, height, stepsTotal, value, handleAlertSideContent, setEditorHighlightedLines]);

  useEffect(() => {
    if (updateCse) {
      CseMachine.resetArrowOriginFilters();
      setArrowFilterOpen(false);
      sliderShift(0);
      sliderRelease(0);
      if (isJava) {
        JavaCseMachine.clearCse();
      } else {
        CseMachine.clearCse();
      }
    }
  }, [updateCse, isJava, sliderShift, sliderRelease]);

  useEffect(() => {
    return () => {
      if (!isJava) {
        CseMachine.resetArrowOriginFilters();
      }
    };
  }, [isJava]);

  const stepPrevious = useCallback(() => {
    if (value !== 0) {
      sliderShift(value - 1);
      sliderRelease(value - 1);
    }
  }, [value, sliderShift, sliderRelease]);

  const stepNext = useCallback(() => {
    const lastStepValue = stepsTotal;
    if (value !== lastStepValue) {
      sliderShift(value + 1);
      sliderRelease(value + 1);
      CseAnimation.enableAnimations();
    }
  }, [value, stepsTotal, sliderShift, sliderRelease]);

  const stepFirst = useCallback(() => {
    // Move to the first step
    sliderShift(0);
    sliderRelease(0);
  }, [sliderShift, sliderRelease]);

  const stepLast = useCallback(
    (lastStepValue: number) => () => {
      // Move to the last step
      sliderShift(lastStepValue);
      sliderRelease(lastStepValue);
    },
    [sliderShift, sliderRelease],
  );

  const stepNextBreakpoint = useCallback(() => {
    for (const step of breakpointSteps) {
      if (step > value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(stepsTotal);
    sliderRelease(stepsTotal);
  }, [breakpointSteps, value, sliderShift, sliderRelease, stepsTotal]);

  const stepPrevBreakpoint = useCallback(() => {
    for (let i = breakpointSteps.length - 1; i >= 0; i--) {
      const step = breakpointSteps[i];
      if (step < value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(0);
    sliderRelease(0);
  }, [breakpointSteps, value, sliderShift, sliderRelease]);

  const stepNextChangepoint = useCallback(() => {
    for (const step of changepointSteps) {
      if (step > value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(stepsTotal);
    sliderRelease(stepsTotal);
  }, [changepointSteps, value, sliderShift, sliderRelease, stepsTotal]);

  const stepPrevChangepoint = useCallback(() => {
    for (let i = changepointSteps.length - 1; i >= 0; i--) {
      const step = changepointSteps[i];
      if (step < value) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(0);
    sliderRelease(0);
  }, [changepointSteps, value, sliderShift, sliderRelease]);

  const toggleArrowFilter = useCallback((origin: ArrowOriginFilterKey) => {
    const filters = CseMachine.getArrowOriginFilters();
    CseMachine.setArrowOriginVisible(origin, !filters[origin]);
    CseMachine.clearRenderedLayouts();
    CseMachine.redraw();
  }, []);

  const setAllArrowFilters = useCallback((visible: boolean) => {
    CseMachine.setAllArrowOriginsVisible(visible);
    CseMachine.clearRenderedLayouts();
    CseMachine.redraw();
  }, []);

  const zoomStage = useCallback(
    (isZoomIn: boolean, multiplier: number) => {
      if (isJava) {
        JavaCseMachine.zoomStage(isZoomIn, multiplier);
      } else {
        Layout.zoomStage(isZoomIn, multiplier);
      }
    },
    [isJava],
  );

  const arrowFilters = CseMachine.getArrowOriginFilters();
  const areAllArrowFiltersSelected = ALL_ARROW_FILTER_KEYS.every(key => arrowFilters[key]);
  const hotkeyBindings: HotkeyItem[] = visualization
    ? [
        ['a', stepFirst],
        ['f', stepNext],
        ['b', stepPrevious],
        ['e', stepLast(stepsTotal)],
      ]
    : [
        ['a', () => {}],
        ['f', () => {}],
        ['b', () => {}],
        ['e', () => {}],
      ];

  const currentStepVal = Math.max(0, value);
  const isAtFirstStep = currentStepVal < 1;
  const isAtLastStep = currentStepVal >= stepsTotal;
  const isNavDisabled = !visualization;

  return (
    <HotKeys
      bindings={hotkeyBindings}
      style={{
        maxHeight: '100%',
        overflow: visualization ? 'hidden' : 'auto',
      }}
    >
      <div className={classNames('sa-substituter', Classes.DARK)}>
        <Slider
          disabled={!visualization}
          min={0}
          max={stepsTotal}
          onChange={sliderShift}
          onRelease={sliderRelease}
          value={value < 0 ? 0 : value}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: isJava ? 'center' : 'space-between',
            alignItems: 'center',
          }}
        >
          {!isJava && (
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

              <Tooltip content="Alignment" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (visualization) {
                      CseMachine.toggleCenterAlignment();
                      CseMachine.redraw();
                    }
                  }}
                  icon="eye-open"
                  disabled={!visualization}
                >
                  <Checkbox
                    checked={CseMachine.getCenterAlignment()}
                    disabled={!visualization}
                    style={{ margin: 0 }}
                  />
                </AnchorButton>
              </Tooltip>
              <Tooltip content="Filter Arrows" compact>
                <Popover
                  isOpen={arrowFilterOpen}
                  onInteraction={nextOpen => setArrowFilterOpen(nextOpen)}
                  position={Position.BOTTOM_LEFT}
                  content={
                    <div style={{ padding: '8px 10px', minWidth: '210px' }}>
                      <div style={{ marginBottom: '8px', fontWeight: 600 }}>Filter Arrows</div>
                      <Button
                        small
                        minimal
                        onClick={() => setAllArrowFilters(!areAllArrowFiltersSelected)}
                        style={{ marginBottom: '8px' }}
                      >
                        {areAllArrowFiltersSelected ? 'Deselect all' : 'Select all'}
                      </Button>
                      <Checkbox
                        checked={arrowFilters.text}
                        label="From text"
                        onChange={() => toggleArrowFilter('text')}
                      />
                      <Checkbox
                        checked={arrowFilters.frame}
                        label="From frames"
                        onChange={() => toggleArrowFilter('frame')}
                      />
                      <Checkbox
                        checked={arrowFilters.function}
                        label="From function objects"
                        onChange={() => toggleArrowFilter('function')}
                      />
                      <Checkbox
                        checked={arrowFilters.array}
                        label="From arrays"
                        onChange={() => toggleArrowFilter('array')}
                      />
                      <Checkbox
                        checked={arrowFilters.control}
                        label="From control"
                        onChange={() => toggleArrowFilter('control')}
                      />
                      <Checkbox
                        checked={arrowFilters.stash}
                        label="From stash"
                        onChange={() => toggleArrowFilter('stash')}
                      />
                    </div>
                  }
                >
                  <AnchorButton icon="flow-branch" disabled={!visualization} />
                </Popover>
              </Tooltip>
            </ButtonGroup>
          )}
          <ButtonGroup>
            <Button
              disabled={isNavDisabled || isAtFirstStep}
              icon="double-chevron-left"
              onClick={stepPrevBreakpoint}
            />
            <Button
              disabled={isNavDisabled || isAtFirstStep}
              icon="chevron-left"
              onClick={isJava || CseMachine.getControlStash() ? stepPrevious : stepPrevChangepoint}
            />
            <Button
              disabled={isNavDisabled || isAtLastStep}
              icon="chevron-right"
              onClick={isJava || CseMachine.getControlStash() ? stepNext : stepNextChangepoint}
            />
            <Button
              disabled={isNavDisabled || isAtLastStep}
              icon="double-chevron-right"
              onClick={stepNextBreakpoint}
            />
          </ButtonGroup>

          {!isJava && (
            <ButtonGroup>
              <Tooltip content="Clear Dead Frames" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (visualization) {
                      const prevLevels = Layout.levels;
                      setClearDeadFrames(true);
                      CseMachine.setClearDeadFrames(true);
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
                    }
                  }}
                  icon="eraser"
                  disabled={clearDeadFrames || !visualization}
                ></AnchorButton>
              </Tooltip>
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
      </div>{' '}
      {visualization && machineOutput.length && machineOutput[0].type === 'errors' ? (
        machineOutput.map((slice, index) => (
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
        <CseMachineDefaultText isJava={isJava} />
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

const makeCseMachineTabFrom = (location: WorkspaceLocation): SideContentTab => ({
  label: t($ => $.cseMachine.label, { ns: 'sideContent' }),
  iconName: IconNames.GLOBE,
  body: <SideContentCseMachine workspaceLocation={location} />,
  id: SideContentType.cseMachine,
});

export const ItalicLink: React.FC<{ href: string; children?: React.ReactNode }> = ({
  href,
  children,
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
            i18nKey={$ => $.cseMachine.csecDescription}
            components={[<ItalicLink href={Links.textbookChapter3_2} />]}
          />{' '}
          <Trans
            ns="sideContent"
            i18nKey={$ => $.cseMachine.javaCsec}
            components={[<ItalicLink href={`${Links.sourceDocs}java_csec/`} />]}
          />
        </span>
      ) : (
        <span>
          <Trans
            ns="sideContent"
            i18nKey={$ => $.cseMachine.cseDescription}
            components={[<ItalicLink href={Links.textbookChapter3_2} />]}
          />
        </span>
      )}
      <br />
      <br />
      {t($ => $.instructions)}
      <br />
      <br />
      <Divider />
      {t($ => $.shortcutsTitle)}
      <br />
      <br />
      {t($ => $.shortcuts.a)}
      <br />
      {t($ => $.shortcuts.e)}
      <br />
      {t($ => $.shortcuts.f)}
      <br />
      {t($ => $.shortcuts.b)}
      <br />
      <br />
      {t($ => $.shortcutsNote)}
    </div>
  );
};

export default makeCseMachineTabFrom;
