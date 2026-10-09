import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hostServices } from '../conductor/cseDiagramService';
import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import CseArrowFilterMenu from './CseArrowFilterMenu';
import CseEnvironmentView from './CseEnvironmentView';
import CseMachine from './CseMachine';
import { CseAnimation } from './CseMachineAnimation';
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
    (Layout.stageRef as React.RefObject<unknown>).current = theirs;
    const { unmount } = render(<CseEnvironmentView snapshots={snapshots} step={0} />);
    unmount();
    expect(Layout.stageRef.current).toBe(theirs);
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
