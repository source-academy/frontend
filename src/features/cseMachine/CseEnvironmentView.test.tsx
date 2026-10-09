import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hostServices } from '../conductor/cseDiagramService';
import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import CseArrowFilterMenu from './CseArrowFilterMenu';
import CseEnvironmentView from './CseEnvironmentView';
import CseMachine from './CseMachine';
import { CseAnimation } from './CseMachineAnimation';
import { Config } from './CseMachineConfig';
import { Layout } from './CseMachineLayout';
import { snapshotWithDeadFrames } from './cseSnapshotHistory';

/** Python-shaped snapshots (as py-slang's CSE machine and e-stepper produce): the builtins'
 * global frame, the program's frame, and a function's frame while it runs. */
const int = (n: number) => ({ displayValue: String(n), label: 'int' });
const global = { id: '-1', name: 'global', parentId: null, bindings: [], isActive: false };
const program = (active: boolean, x: number) => ({
  id: '45',
  name: 'programEnvironment',
  parentId: '-1',
  bindings: [{ name: 'x', value: int(x) }],
  isActive: active,
});
const call = {
  id: '47',
  name: 'f',
  parentId: '45',
  bindings: [{ name: 'n', value: int(1) }],
  isActive: true,
};
const snapshots: CseSnapshot[] = [
  { stepIndex: 0, control: [], stash: [], environments: [program(true, 1), global] },
  { stepIndex: 1, control: [], stash: [], environments: [call, program(false, 1), global] },
  { stepIndex: 2, control: [], stash: [], environments: [program(true, 2), global] },
];

afterEach(() => {
  vi.restoreAllMocks();
  CseMachine.clearCachedLayouts();
});

describe('snapshotWithDeadFrames', () => {
  test('adds the frames of earlier snapshots that are gone, as dead frames', () => {
    const result = snapshotWithDeadFrames(snapshots, 2);
    expect(result.environments.map(f => f.id)).toEqual(['45', '-1', '47']);
    expect(result.environments[2]).toMatchObject({ isActive: false, isOnCallStack: false });
    expect(snapshotWithDeadFrames(snapshots, 0).environments).toEqual(snapshots[0].environments);
  });
});

describe('CseMachine.drawEnvironments', () => {
  test('draws, and leaves the CSE Machine tab its own state', () => {
    CseMachine.toggleControlStash();
    const controlStash = CseMachine.getControlStash();
    const drawing = CseMachine.drawEnvironments(snapshots[1], {
      width: 600,
      height: 400,
      clearDeadFrames: true,
    });
    expect(drawing).not.toBeNull();
    expect(CseMachine.getControlStash()).toBe(controlStash);
    expect(Layout.clearDeadFrames).toBe(false);
    CseMachine.toggleControlStash();
  });
});

describe('Layout.lend / Layout.reclaim', () => {
  test('give the CSE Machine tab back every shared ref, its dimensions, and its deferred resize', () => {
    const refs = [
      Layout.stageRef,
      Layout.contentGroupRef,
      Layout.animationGroupRef,
      Layout.arrowUnderlayLayerRef,
      Layout.liveArrowLayerRef,
      Layout.scrollContainerRef,
      CseAnimation.layerRef,
    ] as { current: unknown }[];
    const theirs = refs.map((ref, i) => (ref.current = { tab: i }));
    Layout.visibleWidth = 321;
    Layout.lend();
    refs.forEach(ref => (ref.current = null));
    Layout.visibleWidth = 600;
    const resize = vi.spyOn(Layout, 'updateDimensions').mockImplementation(() => {});
    CseMachine.updateDimensions(800, 500);
    expect(resize).not.toHaveBeenCalled();
    Layout.reclaim();
    expect(refs.map(ref => ref.current)).toEqual(theirs);
    expect(Layout.visibleWidth).toBe(321);
    expect(resize).toHaveBeenCalledWith(800, 500);
    refs.forEach(ref => (ref.current = null));
  });
});

describe('dead functions in an otherwise empty frame', () => {
  /** `lambda x: x` as an expression statement, from the e-stepper: while its value is on the
   * stash the function is live; once the statement is finished it is a dead function in the
   * (bindingless) program frame. */
  const global = {
    id: '-1',
    name: 'global',
    label: 'Built-ins',
    parentId: null,
    bindings: [],
    isActive: false,
    isOnCallStack: false,
  };
  const fn = {
    displayValue: 'lambda',
    label: 'function',
    metadata: { closureFrameId: 'Global', params: ['x'], funcName: 'lambda', body: 'x' },
    objectId: '#1',
  };
  const program = (heapObjects?: (typeof fn)[]) => ({
    id: 'Global',
    name: 'programEnvironment',
    label: 'Global',
    parentId: '-1',
    bindings: [],
    isActive: true,
    isOnCallStack: true,
    heapObjects,
  });
  const run = [
    { stepIndex: 0, control: [], stash: [fn], environments: [program(), global] },
    { stepIndex: 1, control: [], stash: [], environments: [program([fn]), global] },
  ] as unknown as CseSnapshot[];
  const drawn = (step: number, clearDeadFrames = false) => {
    CseMachine.drawEnvironments(snapshotWithDeadFrames(run, step), {
      width: 600,
      height: 400,
      clearDeadFrames,
    });
    return {
      frames: Layout.levels.flatMap(l => l.frames).map(f => f.environment.id),
      values: Layout.values.size,
    };
  };

  test('the frame and the function stay, greyed out, once nothing reaches them', () => {
    expect(drawn(0)).toEqual({ frames: ['-1', 'Global'], values: 1 });
    expect(drawn(1)).toEqual({ frames: ['-1', 'Global'], values: 1 });
  });

  test('Clear Dead Frames still removes them', () => {
    expect(drawn(1, true).frames).not.toContain('Global');
  });
});

describe('CseMachine.drawEnvironments alignment', () => {
  /** The program frame (one on its level) above two call frames (two on theirs). */
  const wide: CseSnapshot = {
    stepIndex: 0,
    control: [],
    stash: [],
    environments: [
      { ...call, id: '47', parentId: '45', isActive: true },
      { ...call, id: '48', name: 'g', parentId: '45', isActive: false },
      program(false, 1),
      global,
    ],
  };
  const programX = () => {
    CseMachine.drawEnvironments(wide, { width: 600, height: 400, clearDeadFrames: false });
    return Layout.levels
      .flatMap(l => l.frames)
      .find(f => f.environment.id === '45')!
      .x();
  };

  test('centers levels when center alignment is on, leaving the tab its layout caches', () => {
    const cache = { tab: true } as never;
    CseMachine.normalLayoutCache = cache;
    const left = programX();
    CseMachine.toggleCenterAlignment();
    try {
      expect(programX()).toBeGreaterThan(left);
    } finally {
      CseMachine.toggleCenterAlignment();
    }
    expect(CseMachine.normalLayoutCache).toBe(cache);
    CseMachine.normalLayoutCache = null;
  });
});

describe('frame colours', () => {
  const framesById = () =>
    new Map(Layout.levels.flatMap(level => level.frames).map(f => [f.environment.id, f as any]));

  test('colour frame boxes, the current one with a wider outline; the CSE tab is unchanged', () => {
    CseMachine.drawEnvironments(snapshots[1], {
      width: 600,
      height: 400,
      clearDeadFrames: false,
      frameColors: { '45': '#4fc3f7', '47': '#ffb74d' },
    });
    const frames = framesById();
    expect(frames.get('45').boxStroke()).toBe('#4fc3f7');
    // The current frame ('47', active in snapshots[1]) keeps its colour instead of the active one.
    expect(frames.get('47').boxStroke()).toBe('#ffb74d');
    expect(frames.get('47').isCurrent).toBe(true);
    expect(Layout.frameColors).toBeUndefined();

    // A current frame without a colour keeps the active colour.
    CseMachine.drawEnvironments(snapshots[1], {
      width: 600,
      height: 400,
      clearDeadFrames: false,
      frameColors: { '45': '#4fc3f7' },
    });
    expect(framesById().get('47').boxStroke()).toBe(Config.ActiveColor);

    CseMachine.drawEnvironments(snapshots[1], { width: 600, height: 400, clearDeadFrames: false });
    expect(framesById().get('47').boxStroke()).toBe(Config.ActiveColor);
  });

  test('a hovered frame gets a darker background, a light grey one in printable mode', () => {
    CseMachine.drawEnvironments(snapshots[1], {
      width: 600,
      height: 400,
      clearDeadFrames: false,
      frameColors: { '47': '#ffb74d' },
    });
    const frame = framesById().get('47');
    const fill = vi.fn();
    const stroke = vi.fn();
    frame.rectRef.current = { fill, stroke };
    frame.setHoverBackground(true);
    expect(fill).toHaveBeenLastCalledWith(Config.HoverFrameBgColor);
    CseMachine.togglePrintableMode();
    try {
      frame.setHoverBackground(true);
      expect(fill).toHaveBeenLastCalledWith(Config.PrintHoverFrameBgColor);
      frame.setHoverBackground(false);
      expect(fill).toHaveBeenLastCalledWith(Config.PrintBgColor);
    } finally {
      CseMachine.togglePrintableMode();
    }
    // The outline (the frame's colour) is left alone.
    expect(stroke).not.toHaveBeenCalled();
  });

  test('frames report hovering only where they are coloured, and are highlighted', () => {
    const onFrameHover = vi.fn();
    Layout.onFrameHover = onFrameHover;
    try {
      CseMachine.drawEnvironments(snapshots[1], {
        width: 600,
        height: 400,
        clearDeadFrames: false,
        frameColors: { '47': '#ffb74d' },
      });
      const frame = framesById().get('47');
      frame.onMouseEnter();
      frame.onMouseLeave();
      expect(onFrameHover.mock.calls).toEqual([['47'], [null]]);
      const hovered = vi.spyOn(frame, 'setHoverBackground');
      const other = vi.spyOn(framesById().get('45'), 'setHoverBackground');
      Layout.highlightFrame('47');
      expect(hovered).toHaveBeenCalledWith(true);
      expect(other).toHaveBeenCalledWith(false);

      // A frame without a colour ('45' here) is not linked: no hover, and its style is the tab's.
      framesById().get('45').onMouseEnter();
      expect(onFrameHover).toHaveBeenCalledTimes(2);

      onFrameHover.mockClear();
      CseMachine.drawEnvironments(snapshots[1], {
        width: 600,
        height: 400,
        clearDeadFrames: false,
      });
      framesById().get('47').onMouseEnter();
      expect(onFrameHover).not.toHaveBeenCalled();
    } finally {
      Layout.onFrameHover = undefined;
    }
  });
});

describe('CseArrowFilterMenu', () => {
  test('offers the filters not excluded, and reports changes', () => {
    const onChange = vi.fn();
    render(<CseArrowFilterMenu exclude={['control', 'stash']} onChange={onChange} />);
    expect(screen.queryByText('From control')).toBeNull();
    fireEvent.click(screen.getByText('From frames'));
    expect(CseMachine.getArrowOriginFilters().frame).toBe(false);
    fireEvent.click(screen.getByText('Select all'));
    expect(CseMachine.getArrowOriginFilters().frame).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(2);
    CseMachine.resetArrowOriginFilters();
  });
});

describe('CseArrowFilterMenu program references', () => {
  test('are offered only when asked for, and off until turned on', () => {
    const onChange = vi.fn();
    const { unmount } = render(<CseArrowFilterMenu onChange={onChange} />);
    expect(screen.queryByText('From program')).toBeNull();
    unmount();
    render(<CseArrowFilterMenu programReferences onChange={onChange} />);
    expect(screen.getByText('From program')).toBeTruthy();
    expect(CseMachine.getArrowOriginFilters().program).toBe(false);
    fireEvent.click(screen.getByText('From program'));
    expect(CseMachine.getArrowOriginFilters().program).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    CseMachine.resetArrowOriginFilters();
    expect(CseMachine.getArrowOriginFilters().program).toBe(false);
  });
});

describe('CseEnvironmentView', () => {
  const sized = () =>
    vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ width: 600, height: 400 } as DOMRect);

  test('draws the current step with earlier frames as dead frames', () => {
    sized();
    const draw = vi.spyOn(CseMachine, 'drawEnvironments');
    const { rerender } = render(<CseEnvironmentView snapshots={snapshots} step={0} />);
    expect(draw).toHaveBeenLastCalledWith(snapshots[0], {
      width: 600,
      height: 400,
      clearDeadFrames: false,
    });
    rerender(<CseEnvironmentView snapshots={snapshots} step={2} />);
    expect(draw.mock.lastCall![0].environments.map(f => f.id)).toEqual(['45', '-1', '47']);
  });

  test('the toolbar clears dead frames until the step changes', () => {
    sized();
    const draw = vi.spyOn(CseMachine, 'drawEnvironments');
    const { container, rerender } = render(<CseEnvironmentView snapshots={snapshots} step={2} />);
    const eraser = container.querySelector('[data-icon="eraser"]')!.closest('a')!;
    act(() => {
      fireEvent.mouseUp(eraser);
    });
    expect(draw.mock.lastCall![1].clearDeadFrames).toBe(true);
    rerender(<CseEnvironmentView snapshots={snapshots} step={1} />);
    expect(draw.mock.lastCall![1].clearDeadFrames).toBe(false);
  });

  test('gives the Layout back when it goes away', () => {
    sized();
    const theirs = { tab: 'cse' };
    const scroll = { tab: 'cse-scroll' };
    (Layout.stageRef as React.RefObject<unknown>).current = theirs;
    (Layout.scrollContainerRef as React.RefObject<unknown>).current = scroll;
    Layout.visibleWidth = 321;
    Layout.visibleHeight = 654;
    const { unmount } = render(<CseEnvironmentView snapshots={snapshots} step={0} />);
    expect(Layout.visibleWidth).toBe(600);
    unmount();
    expect(Layout.stageRef.current).toBe(theirs);
    expect(Layout.scrollContainerRef.current).toBe(scroll);
    expect(Layout.visibleWidth).toBe(321);
    expect(Layout.visibleHeight).toBe(654);
    (Layout.scrollContainerRef as React.RefObject<unknown>).current = null;
  });

  test('links hovering with the plugin', () => {
    sized();
    const highlight = vi.spyOn(Layout, 'highlightObject');
    const onHover = vi.fn();
    const { rerender, unmount } = render(
      <CseEnvironmentView snapshots={snapshots} step={0} hovered={null} onHover={onHover} />,
    );
    expect(Layout.onObjectHover).toBe(onHover);
    expect(highlight).toHaveBeenLastCalledWith(null);
    rerender(<CseEnvironmentView snapshots={snapshots} step={0} hovered="#1" onHover={onHover} />);
    expect(highlight).toHaveBeenLastCalledWith('#1');
    unmount();
    expect(Layout.onObjectHover).toBeUndefined();
  });

  test('links frames with the plugin: colours, hovering, highlighting', () => {
    sized();
    const draw = vi.spyOn(CseMachine, 'drawEnvironments');
    const highlight = vi.spyOn(Layout, 'highlightFrame');
    const onHoverFrame = vi.fn();
    const frameColors = { '45': '#4fc3f7' };
    const { rerender, unmount } = render(
      <CseEnvironmentView
        snapshots={snapshots}
        step={0}
        frameColors={frameColors}
        hoveredFrame={null}
        onHoverFrame={onHoverFrame}
      />,
    );
    expect(draw.mock.lastCall![1].frameColors).toBe(frameColors);
    expect(Layout.onFrameHover).toBe(onHoverFrame);
    rerender(
      <CseEnvironmentView
        snapshots={snapshots}
        step={0}
        frameColors={frameColors}
        hoveredFrame="45"
        onHoverFrame={onHoverFrame}
      />,
    );
    expect(highlight).toHaveBeenLastCalledWith('45');
    unmount();
    expect(Layout.onFrameHover).toBeUndefined();
  });

  test('reports no anchors until program references are turned on', () => {
    sized();
    const onAnchors = vi.fn();
    const { unmount } = render(
      <CseEnvironmentView snapshots={snapshots} step={0} onAnchors={onAnchors} />,
    );
    expect(onAnchors).toHaveBeenCalled();
    expect(onAnchors.mock.calls.every(([resolve]) => resolve === null)).toBe(true);
    unmount();
  });

  test('reports where frames are drawn once program references are on, and none when it goes away', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      width: 600,
      height: 400,
    } as DOMRect);
    CseMachine.setArrowOriginVisible('program', true);
    const onAnchors = vi.fn();
    try {
      const { unmount } = render(
        <CseEnvironmentView snapshots={snapshots} step={1} onAnchors={onAnchors} />,
      );
      const resolve = onAnchors.mock.calls.map(([r]) => r).findLast(r => r !== null);
      expect(resolve).toBeDefined();
      // The stage is panned by (5, 7) and zoomed 2x; its container and the view start at the
      // same place, so only the stage's transform shows.
      vi.spyOn(Layout.stageRef.current!, 'getAbsoluteTransform').mockReturnValue({
        point: ({ x, y }: { x: number; y: number }) => ({ x: x * 2 + 5, y: y * 2 + 7 }),
      } as never);
      const frame = Layout.levels
        .flatMap(level => level.frames)
        .find(f => f.environment.id === '45')!;
      expect(resolve({ kind: 'frame', id: '45' })).toEqual({
        x: frame.x() * 2 + 5,
        y: frame.y() * 2 + frame.height() + 7,
      });
      expect(resolve({ kind: 'frame', id: 'nope' })).toBeNull();
      expect(resolve({ kind: 'object', id: 'nope' })).toBeNull();
      unmount();
      expect(onAnchors).toHaveBeenLastCalledWith(null);
    } finally {
      CseMachine.resetArrowOriginFilters();
    }
  });

  test('draws nothing before it has a size', () => {
    const draw = vi.spyOn(CseMachine, 'drawEnvironments');
    render(<CseEnvironmentView snapshots={snapshots} step={0} />);
    expect(draw).not.toHaveBeenCalled();
  });
});

test('the host service creates the environment view', () => {
  const element = hostServices.cseDiagram!.createView({ snapshots, step: 1 }) as React.ReactElement;
  expect(element.type).toBe(CseEnvironmentView);
  expect(element.props).toEqual({ snapshots, step: 1 });
});
