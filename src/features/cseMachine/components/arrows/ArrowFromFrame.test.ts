import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { describe, expect, it } from 'vitest';

import type { CseSnapshot } from '../../../conductor/CseMachineHostPlugin';
import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import type { EnvTree } from '../../CseMachineTypes';
import { buildFakeEnvTreeFromSnapshot } from '../../CseSnapshotAdapter';
import { Frame } from '../Frame';

type Binding = { name: string; value: { displayValue: string; label: string } };
const binding = (name: string): Binding => ({
  name,
  value: { displayValue: '1', label: 'number' },
});
const frameOf = (id: string, parentId: string, names: string[], extra = {}) => ({
  id,
  name: id,
  parentId,
  bindings: names.map(binding),
  isActive: false,
  ...extra,
});

/** The frames of a snapshot, laid out, by id. */
function layOut(environments: object[]): (id: string) => Frame {
  const snapshot = {
    stepIndex: 0,
    control: [],
    stash: [],
    environments: [
      { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
      ...environments,
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
  const byId = new Map<string, Frame>();
  const stack = [envTree.root!];
  while (stack.length > 0) {
    const node = stack.pop()!;
    byId.set(node.environment.id, Frame.getFrom(node.environment as never)!);
    stack.push(...node.children);
  }
  return id => byId.get(id)!;
}

/** The corners of a frame's arrow to its parent: up from the frame, across, up to the parent. */
function corners(frame: Frame) {
  frame.arrow!.draw();
  const [x1, y1, x2, y2, x3, y3, x4, y4] = frame.arrow!.points;
  return {
    top: y1,
    across: y2,
    parentX: x3,
    endY: y4,
    startX: x1,
    upX: x2,
    acrossEnd: y3,
    endX: x4,
  };
}

/** The radii of the rounded corners of an arrow's path (`L x1 y1 Q xb yb x2 y2`: from (x1, y1) to the corner). */
function radii(frame: Frame): number[] {
  frame.arrow!.draw();
  const path = (frame.arrow as unknown as { _path: string })._path;
  return [...path.matchAll(/L ([\d.-]+) ([\d.-]+) Q ([\d.-]+) ([\d.-]+) /g)].map(m =>
    Math.hypot(Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2])),
  );
}

describe('the arrow from a frame to its parent (#4512)', () => {
  it('runs across the middle between the parent and the frame', () => {
    const frame = layOut([frameOf('f0', 'g', ['x']), frameOf('f1', 'g', ['x'])]);
    const f1 = frame('f1');
    expect(f1.x()).toBeGreaterThan(frame('g').x());
    const arrow = corners(f1);
    const parentBottom = frame('g').y() + frame('g').height();
    expect(arrow.across).toBe(arrow.acrossEnd);
    expect(arrow.endY).toBe(parentBottom);
    expect(arrow.across).toBeGreaterThan(parentBottom);
    expect(arrow.across).toBeLessThan(f1.y());
    // as far from the one as from the other
    expect(arrow.across - parentBottom).toBeCloseTo(f1.y() - arrow.across, 5);
  });

  it('turns with the same radius where it leaves the frame as where it reaches the parent', () => {
    const frame = layOut([frameOf('f0', 'g', ['x']), frameOf('f1', 'g', ['x'])]);
    const [leaving, reaching] = radii(frame('f1'));
    expect(leaving).toBeCloseTo(reaching, 5);
    // (it was Config.ArrowMinCornerRadius where the arrow left the frame, as it ran 10 above it)
    expect(leaving).toBeGreaterThan(Config.ArrowMinCornerRadius);
  });

  it('has its heading right above the frame, so that the arrow does not strike it through', () => {
    const frame = layOut([frameOf('f0', 'g', ['x']), frameOf('f1', 'g', ['x'])]);
    const f1 = frame('f1');
    const arrow = corners(f1);
    expect(f1.name.y() + Config.FontSize).toBe(f1.y());
    // not across the heading
    const crossesHeading =
      arrow.across > f1.name.y() && arrow.across < f1.name.y() + Config.FontSize;
    expect(crossesHeading).toBe(false);
  });

  it('runs between the two heading rows of a frame that has a globals row', () => {
    const frame = layOut([
      frameOf('f0', 'g', ['y']),
      frameOf('f1', 'g', ['y'], { globalNames: ['x'] }),
    ]);
    const f1 = frame('f1');
    const arrow = corners(f1);
    const names = f1.globalNamesText!;
    expect(f1.name.y() + Config.FontSize).toBeLessThanOrEqual(names.y());
    expect(names.y() + Config.FontSize).toBe(f1.y());
    for (const text of [f1.name, names]) {
      expect(arrow.across > text.y() && arrow.across < text.y() + Config.FontSize).toBe(false);
    }
  });

  it('runs below a taller frame of the parent level that it passes under', () => {
    // a (short) and b (tall) are side by side; c1 and c2 are a's children, and c2, which is to the
    // right of c1, is under b.
    const frame = layOut([
      frameOf('a', 'g', ['p']),
      frameOf('b', 'g', ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']),
      frameOf('c1', 'a', ['u']),
      frameOf('c2', 'a', ['v']),
    ]);
    const a = frame('a');
    const b = frame('b');
    const c2 = frame('c2');
    expect(b.height()).toBeGreaterThan(a.height());
    expect(c2.x()).toBeGreaterThan(b.x() - 1);
    const arrow = corners(c2);
    expect(arrow.across).toBeGreaterThan(b.y() + b.height());
    expect(arrow.across).toBeLessThan(c2.y());
    // centered between the lower edge of b and the frame
    expect(arrow.across - (b.y() + b.height())).toBeCloseTo(c2.y() - arrow.across, 5);
  });
});
