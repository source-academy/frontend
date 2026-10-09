import {
  AnchorButton,
  Button,
  ButtonGroup,
  Checkbox,
  Popover,
  Position,
  Tooltip,
} from '@blueprintjs/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import { ArrayValue } from './components/values/ArrayValue';
import { FnValue } from './components/values/FnValue';
import CseArrowFilterMenu from './CseArrowFilterMenu';
import CseMachine from './CseMachine';
import { Layout } from './CseMachineLayout';
import { snapshotWithDeadFrames } from './cseSnapshotHistory';

/** A point in the view's own coordinates: pixels from its top-left corner. */
type AnchorPoint = { x: number; y: number };

/**
 * Finds where a heap object or a frame is drawn now (with the user's pan and zoom), for an arrow
 * pointing at it: `null` if it is not drawn. See `onAnchors`.
 */
export type CseDiagramAnchorResolver = (target: {
  kind: 'object' | 'frame';
  id: string;
}) => AnchorPoint | null;

export type CseEnvironmentViewProps = {
  /** A run's snapshots; frames from earlier snapshots are shown as dead frames. */
  snapshots: CseSnapshot[];
  /** The 0-based index of the snapshot to draw. */
  step: number;
  /** The `objectId` of the heap object to highlight, if any. */
  hovered?: string | null;
  /** Called with a heap object's `objectId` when the mouse enters it, and `null` when it leaves. */
  onHover?: (objectId: string | null) => void;
  /** Frame colours by frame id: a frame's box takes its colour; the current one is wider. */
  frameColors?: Record<string, string>;
  /** The id of the frame to highlight, if any. */
  hoveredFrame?: string | null;
  /** Called with a frame's id when the mouse enters it, and `null` when it leaves. */
  onHoverFrame?: (frameId: string | null) => void;
  /**
   * Offers the "From program" arrow filter, off until the user turns it on. While it is on,
   * called with a resolver of where objects and frames are drawn, again whenever the drawing moves
   * (a redraw, pan, zoom), so the plugin can draw arrows into the diagram from its own panes; with
   * `null` when it is off, and when the view goes away.
   */
  onAnchors?: (resolve: CseDiagramAnchorResolver | null) => void;
};

/**
 * The CSE machine diagram of one snapshot's environments (no control and stash), with the CSE
 * Machine tab's diagram toolbar: alignment, arrow filters, clearing dead frames, printable mode,
 * saving, zoom. Lent to web plugins through the host's `ICseDiagramService` (see
 * `cseDiagramService.ts`) — the environment stepper's environment pane is one.
 *
 * The CSE machine `Layout` is a singleton, and the CSE Machine tab may be mounted (hidden) at the
 * same time, so this view draws only while it is visible, borrowing `Layout` (`Layout.lend`) and
 * giving it back (`Layout.reclaim`: the tab's refs, dimensions and any resize it asked for
 * meanwhile) when it is not. While it is visible, `Layout`'s stage is this view's, so `Layout`'s
 * own zoom and image export act on it.
 *
 * Closures and arrays whose snapshot values carry an `objectId` are linked to the plugin: the one
 * that is `hovered` is highlighted, and `onHover` is told which one the mouse enters. Likewise for
 * frames (`hoveredFrame`, `onHoverFrame`), which take the plugin's `frameColors`; the current frame
 * keeps its colour, with a wider outline.
 */
function CseEnvironmentView({
  snapshots,
  step,
  hovered,
  onHover,
  frameColors,
  hoveredFrame,
  onHoverFrame,
  onAnchors,
}: CseEnvironmentViewProps) {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [visible, setVisible] = useState(false);
  const [clearDeadFrames, setClearDeadFrames] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  /** Bumped to redraw after a display preference changes. */
  const [version, setVersion] = useState(0);
  const redraw = useCallback(() => setVersion(v => v + 1), []);
  // The diagram area's size.
  useEffect(() => {
    if (!area) {
      return;
    }
    const measure = (width: number, height: number) =>
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    const rect = area.getBoundingClientRect();
    measure(rect.width, rect.height);
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(entries =>
      measure(entries[0].contentRect.width, entries[0].contentRect.height),
    );
    observer.observe(area);
    return () => observer.disconnect();
  }, [area]);

  // Whether this view is on screen (a side-content tab that is not selected is not).
  useEffect(() => {
    if (!area) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      Layout.lend();
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      const isVisible = entries[entries.length - 1].isIntersecting;
      if (isVisible) {
        Layout.lend();
      }
      setVisible(isVisible);
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [area]);

  // Once this view's drawing is gone (hidden or unmounted), give `Layout` back.
  useEffect(() => {
    if (!visible) {
      Layout.reclaim();
    }
  }, [visible]);
  useEffect(() => () => Layout.reclaim(), []);

  // As in the CSE Machine tab, moving to another step shows dead frames again.
  useEffect(() => setClearDeadFrames(false), [snapshots, step]);

  const drawing = useMemo(() => {
    if (!visible || size.width === 0 || size.height === 0 || snapshots[step] === undefined) {
      return null;
    }
    return CseMachine.drawEnvironments(snapshotWithDeadFrames(snapshots, step), {
      width: size.width,
      height: size.height,
      clearDeadFrames,
      frameColors,
    });
    // `version` redraws after a change to the shared display preferences.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, size, snapshots, step, clearDeadFrames, frameColors, version]);

  // Hovering: the diagram reports the object under the mouse while this view has the `Layout`,
  // and highlights the hovered object (also when it is hovered elsewhere, e.g. in the plugin's
  // program pane).
  useEffect(() => {
    if (!visible || !onHover) {
      return;
    }
    Layout.onObjectHover = onHover;
    return () => {
      if (Layout.onObjectHover === onHover) {
        Layout.onObjectHover = undefined;
      }
    };
  }, [visible, onHover]);
  useEffect(() => {
    if (drawing) {
      Layout.highlightObject(hovered ?? null);
    }
  }, [drawing, hovered]);
  // The same for frames.
  useEffect(() => {
    if (!visible || !onHoverFrame) {
      return;
    }
    Layout.onFrameHover = onHoverFrame;
    return () => {
      if (Layout.onFrameHover === onHoverFrame) {
        Layout.onFrameHover = undefined;
      }
    };
  }, [visible, onHoverFrame]);
  useEffect(() => {
    if (drawing) {
      Layout.highlightFrame(hoveredFrame ?? null);
    }
  }, [drawing, hoveredFrame]);

  // From program: while the filter is on, tell the plugin where things are drawn, and again
  // whenever the user pans or zooms (the resolver reads the stage as it is when asked, but the
  // plugin only asks again when told).
  const programReferences = CseMachine.getArrowOriginFilters().program;
  useEffect(() => {
    if (!onAnchors) {
      return;
    }
    const stage = Layout.stageRef.current;
    if (!drawing || !programReferences || !stage) {
      onAnchors(null);
      return;
    }
    const announce = () => onAnchors(anchorResolver(rootRef.current));
    announce();
    stage.on('dragmove.anchors wheel.anchors', announce);
    return () => {
      stage.off('dragmove.anchors wheel.anchors');
      onAnchors(null);
    };
  }, [onAnchors, drawing, programReferences, version]);

  const toggle = (label: string, icon: string, checked: boolean, onToggle: () => void) => (
    <Tooltip content={label} compact>
      <AnchorButton
        onMouseUp={() => {
          onToggle();
          redraw();
        }}
        icon={icon as never}
        disabled={!drawing}
      >
        <Checkbox checked={checked} disabled={!drawing} style={{ margin: 0 }} />
      </AnchorButton>
    </Tooltip>
  );

  return (
    <div
      ref={rootRef}
      className="sa-cse-environment-view"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <ButtonGroup>
          {toggle('Alignment', 'eye-open', CseMachine.getCenterAlignment(), () =>
            CseMachine.toggleCenterAlignment(),
          )}
          <Tooltip content="Filter Arrows" compact>
            <Popover
              isOpen={filtersOpen}
              onInteraction={setFiltersOpen}
              position={Position.BOTTOM_LEFT}
              content={
                <CseArrowFilterMenu
                  exclude={['control', 'stash']}
                  programReferences={onAnchors !== undefined}
                  onChange={() => {
                    CseMachine.clearRenderedLayouts();
                    redraw();
                  }}
                />
              }
            >
              <AnchorButton icon="flow-branch" disabled={!drawing} />
            </Popover>
          </Tooltip>
        </ButtonGroup>
        <ButtonGroup>
          <Tooltip content="Clear Dead Frames" compact>
            <AnchorButton
              onMouseUp={() => setClearDeadFrames(true)}
              icon="eraser"
              disabled={clearDeadFrames || !drawing}
            />
          </Tooltip>
          {toggle('Print', 'print', CseMachine.getPrintableMode(), () =>
            CseMachine.togglePrintableMode(),
          )}
          <Tooltip content="Save" compact>
            <AnchorButton icon="floppy-disk" disabled={!drawing} onClick={Layout.exportImage} />
          </Tooltip>
        </ButtonGroup>
      </div>
      <div
        ref={setArea}
        style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}
      >
        {drawing}
        <ButtonGroup vertical style={{ position: 'absolute', bottom: 12, right: 12 }}>
          <Button
            icon="plus"
            disabled={!drawing}
            onClick={() => {
              Layout.zoomStage(true, 5);
              redraw();
            }}
            style={{ marginBottom: 5, borderRadius: 3 }}
          />
          <Button
            icon="minus"
            disabled={!drawing}
            onClick={() => {
              Layout.zoomStage(false, 5);
              redraw();
            }}
            style={{ borderRadius: 3 }}
          />
        </ButtonGroup>
      </div>
    </div>
  );
}

/**
 * A resolver of where heap objects and frames are drawn on the lent `Layout`'s stage, relative to
 * `root`. Arrows end at the horizontal centre of the top of the object's drawing (its circles or
 * boxes), or at the left edge of the frame's box.
 */
export function anchorResolver(root: HTMLElement | null): CseDiagramAnchorResolver {
  return ({ kind, id }) => {
    const stage = Layout.stageRef.current;
    if (!stage || !root) {
      return null;
    }
    let at: AnchorPoint | undefined;
    if (kind === 'object') {
      for (const value of Layout.values.values()) {
        if (
          (value instanceof FnValue || value instanceof ArrayValue) &&
          (value.data as { objectId?: string }).objectId === id
        ) {
          // Not drawn: what Clear Dead Frames hides (as `ArrayValue.draw` skips it).
          if (Layout.clearDeadFrames && !value.isLive()) {
            return null;
          }
          // The horizontal centre of its top: the arrow comes down onto it. A function's `y()` is
          // the centre of its circles (its top is a radius above); an array's is its top edge.
          at = {
            x: value.x() + value.width() / 2,
            y: value instanceof FnValue ? value.y() - value.height() / 2 : value.y(),
          };
          break;
        }
      }
    } else {
      for (const level of Layout.levels) {
        const frame = level.frames.find(f => f.environment.id === id);
        if (frame) {
          at = { x: frame.x(), y: frame.y() + frame.height() / 2 };
          break;
        }
      }
    }
    if (!at) {
      return null;
    }
    // The stage's own transform (pan and zoom), then where its container is, relative to the root.
    const onStage = stage.getAbsoluteTransform().point(at);
    const container = stage.container().getBoundingClientRect();
    const origin = root.getBoundingClientRect();
    return {
      x: container.left + onStage.x - origin.left,
      y: container.top + onStage.y - origin.top,
    };
  };
}

export default CseEnvironmentView;
