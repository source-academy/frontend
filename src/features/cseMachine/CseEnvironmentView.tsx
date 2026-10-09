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
import CseArrowFilterMenu from './CseArrowFilterMenu';
import CseMachine from './CseMachine';
import { Layout } from './CseMachineLayout';
import { snapshotWithDeadFrames } from './cseSnapshotHistory';

export type CseEnvironmentViewProps = {
  /** A run's snapshots; frames from earlier snapshots are shown as dead frames. */
  snapshots: CseSnapshot[];
  /** The 0-based index of the snapshot to draw. */
  step: number;
  /** The `objectId` of the heap object to highlight, if any. */
  hovered?: string | null;
  /** Called with a heap object's `objectId` when the mouse enters it, and `null` when it leaves. */
  onHover?: (objectId: string | null) => void;
};

type LayoutRefs = {
  stage: unknown;
  scroll: unknown;
  width: number;
  height: number;
};

/**
 * The CSE machine diagram of one snapshot's environments (no control and stash), with the CSE
 * Machine tab's diagram toolbar: alignment, arrow filters, clearing dead frames, printable mode,
 * saving, zoom. Lent to web plugins through the host's `ICseDiagramService` (see
 * `cseDiagramService.ts`) — the environment stepper's environment pane is one.
 *
 * The CSE machine `Layout` is a singleton, and the CSE Machine tab may be mounted (hidden) at the
 * same time, so this view draws only while it is visible, and gives the `Layout`'s stage, scroll
 * container and size back to the CSE Machine tab when it is not. While it is visible, `Layout`'s
 * stage is this view's, so `Layout`'s own zoom and image export act on it.
 *
 * Closures and arrays whose snapshot values carry an `objectId` are linked to the plugin: the one
 * that is `hovered` is highlighted, and `onHover` is told which one the mouse enters.
 */
export default function CseEnvironmentView({
  snapshots,
  step,
  hovered,
  onHover,
}: CseEnvironmentViewProps) {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [visible, setVisible] = useState(false);
  const [clearDeadFrames, setClearDeadFrames] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  /** Bumped to redraw after a display preference changes. */
  const [version, setVersion] = useState(0);
  const redraw = useCallback(() => setVersion(v => v + 1), []);
  /** The CSE Machine tab's `Layout` refs and size, while this view has taken them over. */
  const saved = useRef<LayoutRefs | null>(null);

  const takeOverLayout = useCallback(() => {
    if (saved.current === null) {
      saved.current = {
        stage: Layout.stageRef.current,
        scroll: Layout.scrollContainerRef.current,
        width: Layout.visibleWidth,
        height: Layout.visibleHeight,
      };
    }
  }, []);
  const giveBackLayout = useCallback(() => {
    const previous = saved.current;
    if (previous === null) {
      return;
    }
    saved.current = null;
    (Layout.stageRef as React.RefObject<unknown>).current = previous.stage;
    (Layout.scrollContainerRef as React.RefObject<unknown>).current = previous.scroll;
    Layout.visibleWidth = previous.width;
    Layout.visibleHeight = previous.height;
  }, []);

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
      takeOverLayout();
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      const isVisible = entries[entries.length - 1].isIntersecting;
      if (isVisible) {
        takeOverLayout();
      }
      setVisible(isVisible);
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [area, takeOverLayout]);

  // Once this view's drawing is gone (hidden or unmounted), give `Layout` back.
  useEffect(() => {
    if (!visible) {
      giveBackLayout();
    }
  }, [visible, giveBackLayout]);
  useEffect(() => giveBackLayout, [giveBackLayout]);

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
    });
    // `version` redraws after a change to the shared display preferences.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, size, snapshots, step, clearDeadFrames, version]);

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
            onClick={() => Layout.zoomStage(true, 5)}
            style={{ marginBottom: 5, borderRadius: 3 }}
          />
          <Button
            icon="minus"
            disabled={!drawing}
            onClick={() => Layout.zoomStage(false, 5)}
            style={{ borderRadius: 3 }}
          />
        </ButtonGroup>
      </div>
    </div>
  );
}
