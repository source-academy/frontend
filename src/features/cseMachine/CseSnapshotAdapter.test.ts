import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import Konva from 'konva';
import { describe, expect, it } from 'vitest';

import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import { Frame } from './components/Frame';
import { FnValue } from './components/values/FnValue';
import CseMachine from './CseMachine';
import { CseAnimation } from './CseMachineAnimation';
import { Config } from './CseMachineConfig';
import { Layout } from './CseMachineLayout';
import type { EnvTree } from './CseMachineTypes';
import { isBuiltInFn } from './CseMachineUtils';
import { buildFakeEnvTreeFromSnapshot } from './CseSnapshotAdapter';

// Real (headless) Konva stage/layer so animation components — which need a live layer
// ref to attach to — can actually construct, matching CseMachineAnimation.test.tsx's setup.
const mockStage = new Konva.Stage({
  container: document.createElement('div'),
  width: 500,
  height: 500,
} as Konva.StageConfig);
const mockLayer = new Konva.Layer();
mockStage.add(mockLayer);
Object.defineProperty(CseAnimation.layerRef, 'current', { value: mockLayer });

function findNode(envTree: ReturnType<typeof buildFakeEnvTreeFromSnapshot>['envTree'], id: string) {
  const root = envTree.root;
  if (!root) {
    return undefined;
  }
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.environment.id === id) {
      return node;
    }
    stack.push(...node.children);
  }
  return undefined;
}

describe('buildFakeEnvTreeFromSnapshot', () => {
  it('threads globalNames from a call frame onto the fake Environment', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
        {
          id: 'f1',
          name: 'f',
          parentId: 'g',
          bindings: [],
          isActive: true,
          globalNames: ['x', 'y'],
        } as any,
      ],
    };

    const { envTree } = buildFakeEnvTreeFromSnapshot(snapshot);
    const callFrameNode = findNode(envTree, 'f1');
    expect((callFrameNode?.environment as any).globalNames).toEqual(['x', 'y']);
  });

  it('leaves globalNames undefined when the frame declares none', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
    };

    const { envTree } = buildFakeEnvTreeFromSnapshot(snapshot);
    const globalNode = findNode(envTree, 'g');
    expect((globalNode?.environment as any).globalNames).toBeUndefined();
  });

  it('renders a Python None binding as "None", not JS null (#4111)', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        {
          id: 'g',
          name: 'global',
          parentId: null,
          bindings: [{ name: 'x', value: { displayValue: 'None', label: 'nonetype' } }],
          isActive: true,
        },
      ],
    };

    const { envTree } = buildFakeEnvTreeFromSnapshot(snapshot);
    const globalNode = findNode(envTree, 'g');
    const head = (globalNode?.environment as any).head;
    expect(head.x).not.toBeNull();
    expect((head.x as { toReplString(): string }).toReplString()).toBe('None');
  });

  it('renders a Python None value on the stash as "None", not JS null (#4111)', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [{ displayValue: 'None', label: 'nonetype' }],
      environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
    };

    const { fakeStash } = buildFakeEnvTreeFromSnapshot(snapshot);
    const [value] = fakeStash.getStack();
    expect(value).not.toBeNull();
    expect((value as { toReplString(): string }).toReplString()).toBe('None');
  });

  it('renders a Python builtin function on the stash unquoted, not as a JS string (#302)', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      // No metadata.closureFrameId — matches what PyCseMachinePlugin actually sends
      // for builtins (only closures/lists get metadata).
      stash: [{ displayValue: 'abs', label: 'builtin_function_or_method' }],
      environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
    };

    const { fakeStash } = buildFakeEnvTreeFromSnapshot(snapshot);
    const [value] = fakeStash.getStack();
    // The old fallback returned the bare displayValue string, which StashItemComponent's
    // `typeof val === 'string'` check then wrapped in quotes as if it were a Python str.
    expect(typeof value).not.toBe('string');
    expect(isBuiltInFn(value)).toBe(true);
    expect(String(value)).toBe('abs');
  });
});

describe('Python LEGB frame labels (#4042) only apply in snapshot mode', () => {
  it('renames "global"/"programEnvironment" for a Python snapshot', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
        {
          id: 'p',
          name: 'programEnvironment',
          parentId: 'g',
          // A frame with a genuinely empty head gets collapsed by Layout's "skip empty
          // environments" behavior; give it one trivial binding to keep it visible.
          bindings: [{ name: 'x', value: { displayValue: '1', label: 'number' } }],
          isActive: true,
        },
      ],
    };

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

    expect(Frame.getFrom(findNode(envTree, 'g')!.environment as any)!.name.partialStr).toBe(
      'Built-in functions',
    );
    expect(Frame.getFrom(findNode(envTree, 'p')!.environment as any)!.name.partialStr).toBe(
      'Globals',
    );
  });
});

describe('Frame rendering of globalNames (via Layout.setContext)', () => {
  it('floats the globalNames annotation above the frame, next to the name, without shifting bindings', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
        {
          id: 'f1',
          name: 'f',
          parentId: 'g',
          bindings: [{ name: 'y', value: { displayValue: '1', label: 'number' } }],
          isActive: true,
          globalNames: ['x'],
        } as any,
      ],
    };

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

    const callFrameEnv = findNode(envTree, 'f1')!.environment;
    const frame = Frame.getFrom(callFrameEnv as any)!;

    expect(frame.globalNamesText).toBeDefined();
    expect(frame.globalNamesText!.partialStr).toContain('globals: x');
    // Sits in its own row above the box, stacked below the frame name (not beside it, since
    // frame names are arbitrary function names of unpredictable length) and not inside the box.
    expect(frame.globalNamesText!.y()).toBeGreaterThan(frame.name.y());
    expect(frame.globalNamesText!.y()).toBeLessThan(frame.y());
    // Left-aligned like the name (never pushed left of the frame's own border), and never at a
    // negative offset regardless of label length.
    expect(frame.globalNamesText!.x()).toBe(frame.name.x());

    // Bindings are unaffected — the first one still starts right at the top padding.
    expect(frame.bindings).toHaveLength(1);
    expect(frame.bindings[0].y()).toBe(frame.y() + 30); // Config.FramePaddingY
  });

  it('widens the frame to fit a label longer than its bindings need, instead of truncating it', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
        {
          id: 'f1',
          name: 'f',
          parentId: 'g',
          // A single short binding would otherwise keep the frame's own box narrow, while the
          // annotation is far wider — this is the scenario that used to get ellipsis-truncated
          // and rendered left of the frame's own border, before the frame width sizing pass
          // was taught to account for the annotation too (same treatment as binding text).
          bindings: [{ name: 'y', value: { displayValue: '3', label: 'number' } }],
          isActive: true,
          globalNames: ['counter_with_a_very_long_descriptive_name'],
        } as any,
      ],
    };

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

    const callFrameEnv = findNode(envTree, 'f1')!.environment;
    const frame = Frame.getFrom(callFrameEnv as any)!;

    expect(frame.globalNamesText!.partialStr).toBe(
      'globals: counter_with_a_very_long_descriptive_name',
    );
    // The frame widened to fit the label (under the FrameDefaultWidth cap), so it's not clipped
    // and stays flush with the frame's own left edge, never overflowing past its right edge.
    expect(frame.globalNamesText!.width()).toBeLessThanOrEqual(frame.width());
    expect(frame.globalNamesText!.x()).toBe(frame.x());
  });

  it('caps the frame width like bindings do, truncating a label wider than FrameDefaultWidth', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
        {
          id: 'f1',
          name: 'f',
          parentId: 'g',
          // A frame with a genuinely empty head gets collapsed by Layout's "skip empty
          // environments" behavior (CseMachineUtils.isEmptyEnvironment), so give it one
          // trivial binding to keep it visible — unrelated to what's under test here.
          bindings: [{ name: 'y', value: { displayValue: '3', label: 'number' } }],
          isActive: true,
          globalNames: [
            'an_extremely_long_variable_name_that_by_itself_should_exceed_the_default_frame_width_cap_used_for_bindings_too',
          ],
        } as any,
      ],
    };

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

    const callFrameEnv = findNode(envTree, 'f1')!.environment;
    const frame = Frame.getFrom(callFrameEnv as any)!;

    expect(frame.width()).toBe(472); // Config.FrameDefaultWidth
    expect(frame.globalNamesText!.partialStr).toContain(Config.Ellipsis);
    expect(frame.globalNamesText!.x()).toBe(frame.x());
  });

  it('has no annotation when the frame declares no globals', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
    };

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

    const globalEnv = findNode(envTree, 'g')!.environment;
    const frame = Frame.getFrom(globalEnv as any)!;
    expect(frame.globalNamesText).toBeUndefined();
  });

  it('keeps the globals annotation aligned with the frame name under center-alignment', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
        {
          id: 'f1',
          name: 'f',
          parentId: 'g',
          bindings: [{ name: 'y', value: { displayValue: '1', label: 'number' } }],
          isActive: true,
          globalNames: ['x'],
        } as any,
      ],
    };

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

    const frame = Frame.getFrom(findNode(envTree, 'f1')!.environment as any)!;

    const wasCentered = CseMachine.getCenterAlignment();
    if (!wasCentered) {
      CseMachine.toggleCenterAlignment();
    }
    try {
      // reassignCoordinatesX is only called from the fixed-position (redraw) path in real use,
      // but it's the unit under test here — see #4068 review: it applied the center-alignment
      // offset to the frame name but not to the globals annotation, leaving the annotation
      // flush-left under a centered name.
      frame.reassignCoordinatesX(frame.x());
      expect(frame.globalNamesText!.x()).toBe(frame.name.x());
    } finally {
      if (!wasCentered) {
        CseMachine.toggleCenterAlignment();
      }
    }
  });
});

describe('assignment animation across a snapshot step (regression)', () => {
  it('animates a statement-only assignment (stash empties afterwards, e.g. Python) without throwing', () => {
    CseMachine.init(
      () => {},
      1000,
      1000,
      () => {},
      () => {},
    );
    if (!CseMachine.getControlStash()) {
      CseMachine.toggleControlStash();
    }

    // Step 1: "x = 5" is about to execute — the value sits on the stash, ASSIGNMENT is next.
    const before: CseSnapshot = {
      stepIndex: 0,
      control: [{ displayText: 'asgn x', metadata: { instrType: 'Assignment', symbol: 'x' } }],
      stash: [{ displayValue: '5', label: 'int' }],
      environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
    };

    // Step 2: assignment has happened. Unlike a JS assignment *expression* (which re-pushes its
    // value), a Python assignment *statement* leaves nothing on the stash.
    const after: CseSnapshot = {
      stepIndex: 1,
      control: [],
      stash: [],
      environments: [
        {
          id: 'g',
          name: 'global',
          parentId: null,
          bindings: [{ name: 'x', value: { displayValue: '5', label: 'int' } }],
          isActive: true,
        },
      ],
    };

    expect(() => {
      CseMachine.renderSnapshot(before);
      CseMachine.renderSnapshot(after);
    }).not.toThrow();

    expect(CseAnimation.animations.map(a => a.constructor.name)).toContain('AssignmentAnimation');
  });
});

describe('a closure whose home frame has no bindings keeps that frame visible (py-slang#469, frontend#4380)', () => {
  it('gives a bare stash closure a frame to point to, with and without clear-dead-frames', () => {
    CseMachine.init(
      () => {},
      1000,
      1000,
      () => {},
      () => {},
    );

    // Mirrors what py-slang actually sends for a top-level `lambda x: x + 2` with no other
    // top-level statement: `programEnvironment` has no bindings at all, yet the closure sitting
    // on the stash still points to it as its defining environment.
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [
        {
          displayValue: 'lambda',
          label: 'function',
          metadata: { closureFrameId: 'p', params: ['x'], funcName: 'lambda' },
        },
      ],
      environments: [
        { id: 'g', name: 'global', parentId: null, bindings: [], isActive: false },
        { id: 'p', name: 'programEnvironment', parentId: 'g', bindings: [], isActive: true },
      ],
    };

    try {
      for (const clearDeadFrames of [false, true]) {
        CseMachine.setClearDeadFrames(clearDeadFrames);
        CseMachine.renderSnapshot(snapshot);

        const programEnv = findNode(
          buildFakeEnvTreeFromSnapshot(snapshot).envTree,
          'p',
        )!.environment;
        expect(Frame.getFrom(programEnv as any)).toBeDefined();

        const fnValue = [...Layout.values.values()].find(v => v instanceof FnValue) as
          | FnValue
          | undefined;
        expect(fnValue).toBeDefined();
        expect(fnValue!.arrow()).toBeDefined();
        expect(fnValue!.arrow()!.target).toBeDefined();
      }
    } finally {
      CseMachine.setClearDeadFrames(false);
    }
  });
});

describe('Source-shaped snapshots (js-slang)', () => {
  const globalFrame = (bindings: CseSnapshot['environments'][number]['bindings']) => ({
    id: 'g',
    name: 'global',
    parentId: null,
    bindings,
    isActive: true,
  });

  it('renders the empty list as a real null, not as Python None', () => {
    // js-slang labels Source's `null` 'empty_list' precisely so it does NOT take the
    // 'nonetype|none|null' branch, which exists to keep Python's None away from the
    // empty-list visual. Source wants that visual.
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [{ displayValue: 'null', label: 'empty_list' }],
      environments: [globalFrame([])],
    };
    const { fakeStash } = buildFakeEnvTreeFromSnapshot(snapshot);
    expect(fakeStash.getStack()[0]).toBeNull();
  });

  it('omits the pre-declared-names sentinel when the global frame has its own bindings', () => {
    // js-slang keeps every builtin in the global environment's head, so the frame arrives full
    // and the sentinel would be a spurious extra row above the real bindings.
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        globalFrame([
          { name: 'display', value: { displayValue: 'display', label: 'builtin' } },
          { name: 'x', value: { displayValue: '1', label: 'number' }, isConst: true },
        ]),
      ],
    };
    const { envTree } = buildFakeEnvTreeFromSnapshot(snapshot);
    const head = findNode(envTree, 'g')!.environment.head;
    expect(Object.keys(head)).toEqual(['display', 'x']);
    expect(Config.GlobalFrameDefaultText in head).toBe(false);
  });

  it('keeps the sentinel when the global frame is empty (py-slang shape)', () => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [globalFrame([])],
    };
    const { envTree } = buildFakeEnvTreeFromSnapshot(snapshot);
    const head = findNode(envTree, 'g')!.environment.head;
    expect(Config.GlobalFrameDefaultText in head).toBe(true);
  });

  it('does not reorder bindings when the global frame has no sentinel', () => {
    // Frame's "move the sentinel first" step used to run findIndex -> -1 and then
    // splice(-1, 1), which reads as "the last entry" and silently promoted an unrelated
    // binding to the front of the global frame.
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        globalFrame([
          { name: 'first', value: { displayValue: '1', label: 'number' } },
          { name: 'middle', value: { displayValue: '2', label: 'number' } },
          { name: 'last', value: { displayValue: '3', label: 'number' } },
        ]),
      ],
    };
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

    const env = findNode(envTree, 'g')!.environment;
    const frame = Frame.getFrom(env as any)!;
    expect(frame).toBeDefined();
    expect(frame.bindings.map(b => b.keyString.replace(/[:\s]+$/, ''))).toEqual([
      'first',
      'middle',
      'last',
    ]);
  });
});

describe('non-finite numbers', () => {
  // NaN and Infinity are predeclared globals in Source, so they appear bound in the global frame
  // of every run. `parseFloat` plus an `isNaN(n) ? 0` fallback rendered NaN as 0 and left
  // anything unparseable as 0 too.
  const stashOf = (displayValue: string) =>
    buildFakeEnvTreeFromSnapshot({
      stepIndex: 0,
      control: [],
      stash: [{ displayValue, label: 'number' }],
      environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
    }).fakeStash.getStack()[0];

  it('renders NaN as NaN, not 0', () => {
    expect(stashOf('NaN')).toBeNaN();
  });

  it('renders Infinity and -Infinity', () => {
    expect(stashOf('Infinity')).toBe(Infinity);
    expect(stashOf('-Infinity')).toBe(-Infinity);
  });

  it('still reads ordinary numbers', () => {
    expect(stashOf('42')).toBe(42);
    expect(stashOf('-3.5')).toBe(-3.5);
    expect(stashOf('0')).toBe(0);
  });

  it('falls back to 0 for something genuinely unparseable', () => {
    expect(stashOf('not a number')).toBe(0);
  });
});

describe('non-finite numbers reach the canvas as themselves', () => {
  // Text renders identifiable values with JSON.stringify, which turns every non-finite number
  // into the *string* "null" — truthy, so the `|| String(data)` fallback never fired. All three
  // are predeclared globals in Source, so this showed in the global frame of every run, and it
  // affected the live (non-snapshot) renderer too.
  const renderedGlobal = (displayValue: string) => {
    const snapshot: CseSnapshot = {
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [
        {
          id: 'g',
          name: 'global',
          parentId: null,
          bindings: [{ name: 'v', value: { displayValue, label: 'number' } }],
          isActive: true,
        },
      ],
    };
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
    const frame = Frame.getFrom(findNode(envTree, 'g')!.environment as any)!;
    return frame.bindings.find(b => b.keyString.startsWith('v'))?.value;
  };

  it.each(['NaN', 'Infinity', '-Infinity'])('%s does not render as null', displayValue => {
    const value = renderedGlobal(displayValue) as { text?: { fullStr?: string } } | undefined;
    // Asserted unconditionally: a guard here would let the test pass vacuously if the binding
    // text ever went missing, which is the regression most worth catching.
    expect(value?.text?.fullStr).toBe(displayValue);
  });
});
