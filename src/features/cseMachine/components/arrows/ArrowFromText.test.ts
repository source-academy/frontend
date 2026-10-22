import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { describe, expect, it } from 'vitest';

import type { CseSnapshot } from '../../../conductor/CseMachineHostPlugin';
import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import type { EnvTree } from '../../CseMachineTypes';
import { buildFakeEnvTreeFromSnapshot } from '../../CseSnapshotAdapter';
import { Frame } from '../Frame';

/**
 * `def make_adder(n): def add(x): return x + n; return add`, `f = make_adder(3)`, `g = f`: the
 * function `add` is drawn below Global, right of the narrow `make_adder` frame, so the x of its
 * top face is less than the straight piece (ArrowFromFrameStraightLength) beyond Global's frame.
 */
function layOut(globalNames: string[] = [], lowerNames: string[] = []): Frame {
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
          ...lowerNames.map(name => ({ name, value: { displayValue: '1', label: 'int' } })),
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

/** The corners of an arrow's path: where it turns, and the radius of the bend. */
function bends(binding: { arrow?: unknown }): { x: number; y: number; r: number }[] {
  const path = (binding.arrow as unknown as { _path: string })._path;
  return [...path.matchAll(/L ([\d.-]+) ([\d.-]+) Q ([\d.-]+) ([\d.-]+) /g)].map(m => ({
    x: Number(m[3]),
    y: Number(m[4]),
    r: Math.hypot(Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2])),
  }));
}

describe('the arrow from a name to a function below its frame (#4517)', () => {
  const wide = ['a_very_long_name_to_make_the_frame_wide', 'another_quite_long_name_for_the_width'];

  it.each([
    ['a frame hardly wider than the one below', [], []],
    ['a frame much wider than the one below', wide, []],
    ['a frame much narrower than the one below', [], wide],
  ])(
    'bends with the full radius at its frame, goes down past it, and then across: %s',
    (_, upperNames, lowerNames) => {
      const global = layOut(upperNames, lowerNames);
      const exitX = global.x() + global.width() + Config.ArrowFromFrameStraightLength;
      const bottom = global.y() + global.height();
      const arrows = global.bindings.filter(b => /^[fg]:/.test(b.keyString));
      expect(arrows).toHaveLength(2);
      for (const binding of arrows) {
        binding.draw();
        binding.arrow!.draw();
        const [leave, ...rest] = bends(binding);
        // leaves the frame with the full radius, and goes down parallel to its right edge
        expect(leave.x).toBe(exitX);
        expect(leave.r).toBe(Config.ArrowCornerRadius);
        // the next turn (towards the function, or down into it) is below the frame
        expect(rest[0].y).toBeGreaterThan(bottom);
        // and the bends of the way across are as wide as it allows
        const [turnA, turnB] = rest;
        if (turnB !== undefined && turnA.x !== turnB.x) {
          const leg = Math.abs(turnA.x - turnB.x);
          expect(turnA.r).toBeCloseTo(Math.min(Config.ArrowCornerRadius, leg / 2), 5);
          expect(turnB.r).toBeCloseTo(Math.min(Config.ArrowCornerRadius, leg / 2), 5);
        }
      }
    },
  );
});
