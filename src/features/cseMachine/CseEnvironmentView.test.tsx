import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hostServices } from '../conductor/cseDiagramService';
import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import CseArrowFilterMenu from './CseArrowFilterMenu';
import CseEnvironmentView from './CseEnvironmentView';
import CseMachine from './CseMachine';
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
