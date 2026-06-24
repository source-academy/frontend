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
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import HotKeys from 'src/commons/hotkeys/HotKeys';
import { Output } from 'src/commons/repl/Repl';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { type WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import type {
  CseSerializedEnvFrame,
  CseSnapshot,
} from 'src/features/conductor/CseMachineHostPlugin';
import { ClearDeadFramesAnimation } from 'src/features/cseMachine/animationComponents/ClearDeadFramesAnimation';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { CseAnimation } from 'src/features/cseMachine/CseMachineAnimation';
import { Layout } from 'src/features/cseMachine/CseMachineLayout';
import type { ArrowOriginFilterKey } from 'src/features/cseMachine/CseMachineTypes';
import { computeFramesCoordChange } from 'src/features/cseMachine/CseMachineUtils';
import { CseMachine as JavaCseMachine } from 'src/features/cseMachine/java/CseMachine';

import { selectConductorEnable } from '../../../features/conductor/flagConductorEnable';
import type { OverallState } from '../../application/ApplicationTypes';
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

type OwnProps = {
  workspaceLocation: WorkspaceLocation;
};

function calculateWidth(editorWidth?: string) {
  const horizontalPadding = 50;
  const maxWidth = 5000;
  if (editorWidth === undefined) {
    return Math.min(window.innerWidth - horizontalPadding, maxWidth);
  }
  return Math.min(
    (window.innerWidth * (100 - parseFloat(editorWidth))) / 100 - horizontalPadding,
    maxWidth,
  );
}

function calculateHeight(sideContentHeight?: number) {
  const verticalPadding = 150;
  const maxHeight = 5000;
  if (window.innerWidth < Constants.mobileBreakpoint || sideContentHeight === undefined) {
    return Math.min(window.innerHeight - verticalPadding, maxHeight);
  }
  return Math.min(sideContentHeight - verticalPadding, maxHeight);
}

export function SideContentCseMachine({ workspaceLocation }: OwnProps) {
  const [loc] = getLocation(workspaceLocation);

  const workspace = useTypedSelector((state: OverallState) =>
    loc === 'sicp' ? state.workspaces.sicp : state.workspaces.playground,
  );
  const isOnCseTab = useTypedSelector(
    (state: OverallState) => state.sideContent[loc]?.selectedTab === SideContentType.cseMachine,
  );
  const isConductorMode = useTypedSelector(selectConductorEnable);

  const {
    stepsTotal,
    breakpointSteps,
    changepointSteps,
    updateCse: needCseUpdate,
    output: machineOutput,
    context: { chapter },
    cseSnapshots,
  } = workspace;

  const dispatch = useDispatch();

  const handleStepUpdate = useCallback(
    (steps: number) => dispatch(WorkspaceActions.updateCurrentStep(steps, workspaceLocation)),
    [dispatch, workspaceLocation],
  );
  const handleEditorEval = useCallback(
    () => dispatch(WorkspaceActions.evalEditor(workspaceLocation)),
    [dispatch, workspaceLocation],
  );
  const handleAlertSideContent = useCallback(
    () => dispatch(beginAlertSideContent(SideContentType.cseMachine, workspaceLocation)),
    [dispatch, workspaceLocation],
  );
  const doSetEditorHighlightedLines = useCallback(
    (editorTabIndex: number, lines: HighlightedLines[]) =>
      dispatch(
        WorkspaceActions.setEditorHighlightedLinesControl(workspaceLocation, editorTabIndex, lines),
      ),
    [dispatch, workspaceLocation],
  );
  const doSetEditorHighlightedLinesStep = useCallback(
    (editorTabIndex: number, lines: HighlightedLines[]) =>
      dispatch(WorkspaceActions.setEditorHighlightedLines(workspaceLocation, editorTabIndex, lines)),
    [dispatch, workspaceLocation],
  );
  const doUpdateCseSnapshots = useCallback(
    (snapshots: CseSnapshot[] | null) =>
      dispatch(WorkspaceActions.updateCseSnapshots(snapshots, workspaceLocation)),
    [dispatch, workspaceLocation],
  );

  const isJava = chapter === Chapter.FULL_JAVA;

  const [visualization, setVisualization] = useState<React.ReactNode>(null);
  const [value, setValue] = useState(-1);
  const [width, setWidth] = useState(() => calculateWidth());
  const [height, setHeight] = useState(() => calculateHeight());
  const [stepLimitExceeded, setStepLimitExceeded] = useState(false);
  const [clearDeadFrames, setClearDeadFrames] = useState(false);
  const [arrowFilterOpen, setArrowFilterOpen] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);

  const accumulatedFrames = useRef(new Map<string, CseSerializedEnvFrame>());

  // Refs for values read inside stable callbacks to avoid stale closures.
  const valueRef = useRef(value);
  const stepsRef = useRef(stepsTotal);
  const cseSnapshotsRef = useRef(cseSnapshots);
  const clearDeadFramesRef = useRef(clearDeadFrames);
  const breakpointStepsRef = useRef(breakpointSteps);
  const changepointStepsRef = useRef(changepointSteps);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { stepsRef.current = stepsTotal; }, [stepsTotal]);
  useEffect(() => { cseSnapshotsRef.current = cseSnapshots; }, [cseSnapshots]);
  useEffect(() => { clearDeadFramesRef.current = clearDeadFrames; }, [clearDeadFrames]);
  useEffect(() => { breakpointStepsRef.current = breakpointSteps; }, [breakpointSteps]);
  useEffect(() => { changepointStepsRef.current = changepointSteps; }, [changepointSteps]);

  // ─── Snapshot rendering ────────────────────────────────────────────────────
  const renderSnapshotAt = useCallback(
    (step: number) => {
      const snaps = cseSnapshotsRef.current;
      if (!snaps) return;
      const snapshot = snaps[step] as CseSnapshot;
      if (!snapshot) return;

      doSetEditorHighlightedLines(0, []);

      accumulatedFrames.current.clear();
      for (let i = 0; i <= step; i++) {
        const s = snaps[i] as CseSnapshot;
        if (!s) continue;
        for (const frame of s.environments) {
          accumulatedFrames.current.set(frame.id, frame);
        }
      }

      const liveIds = new Set(snapshot.environments.map((f: CseSerializedEnvFrame) => f.id));
      const deadFrames = [...accumulatedFrames.current.values()]
        .filter(f => !liveIds.has(f.id))
        .map(f => ({ ...f, isActive: false, isOnCallStack: false }));

      CseMachine.clearLiveLayouts();
      CseMachine.renderSnapshot({
        ...snapshot,
        environments: [...snapshot.environments, ...deadFrames],
      });

      doSetEditorHighlightedLinesStep(0, []);
      if (snapshot.currentLine !== undefined && snapshot.currentLine > 0) {
        const row = snapshot.currentLine - 1;
        doSetEditorHighlightedLinesStep(0, [[row, row]]);
      }
    },
    [doSetEditorHighlightedLines, doSetEditorHighlightedLinesStep],
  );

  // ─── Slider / navigation (stable callbacks via refs) ───────────────────────
  const sliderRelease = useCallback(
    (newValue: number) => {
      if (cseSnapshotsRef.current) {
        renderSnapshotAt(newValue);
        return;
      }
      handleEditorEval();
    },
    [renderSnapshotAt, handleEditorEval],
  );

  const sliderShift = useCallback(
    (newValue: number) => {
      if (clearDeadFramesRef.current) {
        CseMachine.setClearDeadFrames(false);
        CseMachine.clearLiveLayouts();
        if (!cseSnapshotsRef.current) CseMachine.redraw();
      }
      handleStepUpdate(newValue);
      setValue(newValue);
      setClearDeadFrames(false);
    },
    [handleStepUpdate],
  );

  const stepFirst = useCallback(() => {
    sliderShift(0);
    sliderRelease(0);
  }, [sliderShift, sliderRelease]);

  const stepLast = useCallback(
    (lastStepValue: number) => () => {
      sliderShift(lastStepValue);
      sliderRelease(lastStepValue);
    },
    [sliderShift, sliderRelease],
  );

  const stepNext = useCallback(() => {
    if (valueRef.current !== stepsRef.current) {
      CseAnimation.enableAnimations();
      sliderShift(valueRef.current + 1);
      sliderRelease(valueRef.current + 1);
    }
  }, [sliderShift, sliderRelease]);

  const stepPrevious = useCallback(() => {
    if (valueRef.current !== 0) {
      sliderShift(valueRef.current - 1);
      sliderRelease(valueRef.current - 1);
    }
  }, [sliderShift, sliderRelease]);

  const stepNextBreakpoint = useCallback(() => {
    const bps = breakpointStepsRef.current;
    const v = valueRef.current;
    for (const step of bps) {
      if (step > v) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(stepsRef.current);
    sliderRelease(stepsRef.current);
  }, [sliderShift, sliderRelease]);

  const stepPrevBreakpoint = useCallback(() => {
    const bps = breakpointStepsRef.current;
    const v = valueRef.current;
    for (let i = bps.length - 1; i >= 0; i--) {
      if (bps[i] < v) {
        sliderShift(bps[i]);
        sliderRelease(bps[i]);
        return;
      }
    }
    sliderShift(0);
    sliderRelease(0);
  }, [sliderShift, sliderRelease]);

  const getChangepointSteps = useCallback((): number[] => {
    const snaps = cseSnapshotsRef.current;
    if (snaps) {
      const steps: number[] = [];
      let prevFp: string | null = null;
      for (let i = 0; i < snaps.length; i++) {
        const fp = JSON.stringify(snaps[i]?.environments ?? []);
        if (prevFp === null || fp !== prevFp) steps.push(i);
        prevFp = fp;
      }
      return steps;
    }
    return changepointStepsRef.current;
  }, []);

  const stepNextChangepoint = useCallback(() => {
    const v = valueRef.current;
    for (const step of getChangepointSteps()) {
      if (step > v) {
        sliderShift(step);
        sliderRelease(step);
        return;
      }
    }
    sliderShift(stepsRef.current);
    sliderRelease(stepsRef.current);
  }, [getChangepointSteps, sliderShift, sliderRelease]);

  const stepPrevChangepoint = useCallback(() => {
    const v = valueRef.current;
    const changeSteps = getChangepointSteps();
    for (let i = changeSteps.length - 1; i >= 0; i--) {
      if (changeSteps[i] < v) {
        sliderShift(changeSteps[i]);
        sliderRelease(changeSteps[i]);
        return;
      }
    }
    sliderShift(0);
    sliderRelease(0);
  }, [getChangepointSteps, sliderShift, sliderRelease]);

  // ─── Arrow filters ────────────────────────────────────────────────────────
  const refreshArrowFilters = useCallback(() => {
    CseMachine.clearRenderedLayouts();
    if (cseSnapshotsRef.current) {
      renderSnapshotAt(valueRef.current);
    } else {
      CseMachine.redraw();
    }
  }, [renderSnapshotAt]);

  const toggleArrowFilter = useCallback(
    (origin: ArrowOriginFilterKey) => {
      CseMachine.setArrowOriginVisible(origin, !CseMachine.getArrowOriginFilters()[origin]);
      refreshArrowFilters();
    },
    [refreshArrowFilters],
  );

  const setAllArrowFilters = useCallback(
    (visible: boolean) => {
      CseMachine.setAllArrowOriginsVisible(visible);
      refreshArrowFilters();
    },
    [refreshArrowFilters],
  );

  const togglePairCreationModeArrows = useCallback(() => {
    CseMachine.togglePairCreationMode();
    refreshArrowFilters();
  }, [refreshArrowFilters]);

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

  // ─── Init CseMachine once on mount ────────────────────────────────────────
  useEffect(() => {
    if (isJava) {
      JavaCseMachine.init(
        vis => setVisualization(vis),
        (segments: [number, number][]) => doSetEditorHighlightedLines(0, segments),
      );
    } else {
      CseMachine.init(
        vis => {
          setVisualization(vis);
          CseAnimation.playAnimation();
          if (vis) handleAlertSideContent();
        },
        width,
        height,
        (segments: [number, number][]) => doSetEditorHighlightedLines(0, segments),
        isControlEmpty => {
          const isAtLastStep = valueRef.current === stepsRef.current;
          setStepLimitExceeded(!isControlEmpty && isAtLastStep);
        },
      );
      if (cseSnapshotsRef.current) {
        renderSnapshotAt(0);
      } else {
        CseMachine.redraw();
      }
    }
    return () => {
      if (!isJava) {
        CseMachine.resetArrowOriginFilters();
        doSetEditorHighlightedLinesStep(0, []);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Window resize ────────────────────────────────────────────────────────
  const handleResizeRef = useRef(
    debounce(() => {
      const newWidth = calculateWidth();
      const newHeight = calculateHeight();
      setWidth(newWidth);
      setHeight(newHeight);
      CseMachine.updateDimensions(newWidth, newHeight);
    }, 300),
  );

  useEffect(() => {
    const handler = handleResizeRef.current;
    handler();
    window.addEventListener('resize', handler);
    return () => {
      handler.cancel();
      window.removeEventListener('resize', handler);
    };
  }, []);

  // ─── Fullscreen ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSliderKey(prev => prev + 1));
      });
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ─── cseSnapshots reference change → clear accumulated frames ─────────────
  const prevCseSnapshotsRef = useRef(cseSnapshots);
  useEffect(() => {
    if (prevCseSnapshotsRef.current !== cseSnapshots) {
      accumulatedFrames.current.clear();
    }
    prevCseSnapshotsRef.current = cseSnapshots;
  }, [cseSnapshots]);

  // ─── Snapshot-mode guards + new-run handling (mirrors componentDidUpdate) ──
  const prevIsOnCseTabRef = useRef(isOnCseTab);
  const prevNeedCseUpdateRef = useRef(needCseUpdate);
  const prevCseSnapshotsGuardRef = useRef(cseSnapshots);

  useEffect(() => {
    const prevIsOnCseTab = prevIsOnCseTabRef.current;
    const prevNeedCseUpdate = prevNeedCseUpdateRef.current;
    const prevCseSnapshots = prevCseSnapshotsGuardRef.current;
    prevIsOnCseTabRef.current = isOnCseTab;
    prevNeedCseUpdateRef.current = needCseUpdate;
    prevCseSnapshotsGuardRef.current = cseSnapshots;

    const inSnapshotMode = isConductorMode;

    if (inSnapshotMode && !isOnCseTab && cseSnapshots !== null && prevCseSnapshots !== cseSnapshots) {
      doUpdateCseSnapshots(null);
      return;
    }

    if (inSnapshotMode && prevIsOnCseTab && !isOnCseTab) {
      setVisualization(null);
      setValue(-1);
      if (cseSnapshots) doUpdateCseSnapshots(null);
      return;
    }

    const shouldProcess = !inSnapshotMode || isOnCseTab;
    if (prevNeedCseUpdate && !needCseUpdate && shouldProcess) {
      setArrowFilterOpen(false);
      if (cseSnapshots) {
        stepFirst();
      } else if (isJava) {
        stepFirst();
        JavaCseMachine.clearCse();
      } else {
        stepFirst();
        CseMachine.clearCse();
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSliderKey(prev => prev + 1));
      });
    }
  }, [isConductorMode, isOnCseTab, cseSnapshots, needCseUpdate, doUpdateCseSnapshots, stepFirst, isJava]);

  // ─── Render ───────────────────────────────────────────────────────────────
  const arrowFilters = CseMachine.getArrowOriginFilters();
  const areAllArrowFiltersSelected = ALL_ARROW_FILTER_KEYS.every(key => arrowFilters[key]);
  const currentStep = Math.max(0, value);
  const isAtFirstStep = currentStep < 1;
  const isAtLastStep = currentStep >= stepsTotal;
  const isNavDisabled = !visualization;

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
          key={sliderKey}
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
                      if (cseSnapshotsRef.current) {
                        renderSnapshotAt(value);
                      } else {
                        CseMachine.redraw();
                      }
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
                      if (cseSnapshotsRef.current) {
                        renderSnapshotAt(value);
                      } else {
                        CseMachine.redraw();
                      }
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
                      if (cseSnapshotsRef.current) {
                        renderSnapshotAt(value);
                      } else {
                        CseMachine.redraw();
                      }
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
                        size="small"
                        variant="minimal"
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
                      <Checkbox
                        checked={CseMachine.getPairCreationMode()}
                        disabled={!visualization}
                        label="Pairs returned by nullary functions"
                        onChange={togglePairCreationModeArrows}
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
                      const originalDraw = Layout.draw;
                      Layout.draw = () => {
                        try {
                          const currLevels = Layout.levels;
                          const changedFramePairs = computeFramesCoordChange(prevLevels, currLevels);
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
                      if (cseSnapshotsRef.current) {
                        renderSnapshotAt(value);
                      } else {
                        CseMachine.redraw();
                      }
                    }
                  }}
                  icon="eraser"
                  disabled={clearDeadFrames || !visualization}
                />
              </Tooltip>
              <Tooltip content="Print" compact>
                <AnchorButton
                  onMouseUp={() => {
                    if (visualization) {
                      CseMachine.togglePrintableMode();
                      if (cseSnapshotsRef.current) {
                        renderSnapshotAt(value);
                      } else {
                        CseMachine.redraw();
                      }
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
      {visualization &&
      machineOutput.length &&
      machineOutput[0].type === 'errors' ? (
        machineOutput.map((slice, index) => (
          <Output output={slice} key={index} usingSubst={false} isHtml={false} />
        ))
      ) : (
        <div />
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
      <ButtonGroup vertical style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
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
}

const makeCseMachineTabFrom = (location: WorkspaceLocation): SideContentTab => ({
  label: t($ => $.cseMachine.label, { ns: 'sideContent' }),
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

function CseMachineDefaultText({ isJava }: { isJava: boolean }) {
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
            // eslint-disable-next-line react/jsx-key
            components={[<ItalicLink href={Links.textbookChapter3_2} />]}
          />{' '}
          <Trans
            ns="sideContent"
            i18nKey={$ => $.cseMachine.javaCsec}
            // eslint-disable-next-line react/jsx-key
            components={[<ItalicLink href={`${Links.sourceDocs}java_csec/`} />]}
          />
        </span>
      ) : (
        <span>
          <Trans
            ns="sideContent"
            i18nKey={$ => $.cseMachine.cseDescription}
            // eslint-disable-next-line react/jsx-key
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
}

export default makeCseMachineTabFrom;
