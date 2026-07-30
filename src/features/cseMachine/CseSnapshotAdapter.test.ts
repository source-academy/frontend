import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import Konva from 'konva';
import { describe, expect, it } from 'vitest';

import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import { Frame } from './components/Frame';
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
