import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { describe, expect, it } from 'vitest';

import type { CseSnapshot } from '../../../conductor/CseMachineHostPlugin';
import { Layout } from '../../CseMachineLayout';
import type { EnvTree } from '../../CseMachineTypes';
import { buildFakeEnvTreeFromSnapshot } from '../../CseSnapshotAdapter';
import { Frame } from '../Frame';

/**
 * `def make_adder(n): def add(x): return x + n; return add`, `f = make_adder(3)`, `g = f`: the
 * function `add` is drawn below Global, right of the narrow `make_adder` frame, so the x of its
 * top face is less than the straight piece (ArrowFromFrameStraightLength) beyond Global's frame.
 */
function layOut(globalNames: string[] = []): Frame {
  const add = {
    displayValue: 'add',
    label: 'function',
    objectId: '#2',
    metadata: { closureFrameId: 'e1', params: ['x'], funcName: 'add' },
  };
  const snapshot = {
    stepIndex: 0,
    control: [],
    stash: [],
    environments: [
      {
        id: 'g',
        name: 'global',
        parentId: null,
        isActive: true,
        bindings: [
          {
            name: 'make_adder_long_name',
            value: {
              ...add,
              objectId: '#1',
              metadata: { closureFrameId: 'g', params: ['n'], funcName: 'make_adder_long_name' },
            },
          },
          ...globalNames.map(name => ({ name, value: { displayValue: '1', label: 'int' } })),
          { name: 'f', value: add },
          { name: 'g', value: add },
        ],
      },
      {
        id: 'e1',
        name: 'make_adder',
        parentId: 'g',
        isActive: false,
        bindings: [
          { name: 'n', value: { displayValue: '3', label: 'int' } },
          { name: 'add', value: add },
        ],
      },
    ],
  } as unknown as CseSnapshot;
  const { envTree, fakeControl, fakeStash } = buildFakeEnvTreeFromSnapshot(snapshot);
  Layout.snapshotMode = true;
  try {
    Layout.setContext(
      envTree as unknown as EnvTree,
      fakeControl as unknown as Control,
      fakeStash as unknown as Stash,
    );
  } finally {
    Layout.snapshotMode = false;
  }
  return Frame.getFrom(envTree.root!.environment as never)!;
}

describe('the arrow from a name to a function below its frame (#4517)', () => {
  const wide = ['a_very_long_name_to_make_the_frame_wide', 'another_quite_long_name_for_the_width'];

  it.each([
    ['a frame hardly wider than the one below', []],
    ['a frame much wider than the one below', wide],
  ])('leaves the frame, goes down past it, and only then turns back: %s', (_, names) => {
    const global = layOut(names);
    const bottom = global.y() + global.height();
    const arrows = global.bindings.filter(b => /^[fg]:/.test(b.keyString));
    expect(arrows).toHaveLength(2);
    for (const binding of arrows) {
      binding.draw();
      binding.arrow!.draw();
      const points = binding.arrow!.points;
      for (let i = 2; i < points.length; i += 2) {
        const [x0, y0, x1, y1] = [points[i - 2], points[i - 1], points[i], points[i + 1]];
        // a piece that goes left (the arrow came out of the frame to the right) is below the frame
        if (x1 < x0) {
          expect(Math.min(y0, y1)).toBeGreaterThan(bottom);
        }
      }
    }
  });
});
