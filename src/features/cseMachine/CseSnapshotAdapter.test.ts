import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { describe, expect, it } from 'vitest';

import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import { Frame } from './components/Frame';
import { Layout } from './CseMachineLayout';
import type { EnvTree } from './CseMachineTypes';
import { buildFakeEnvTreeFromSnapshot } from './CseSnapshotAdapter';

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
});

describe('Frame rendering of globalNames (via Layout.setContext)', () => {
  it('reserves vertical space for the annotation and pushes the first binding below it', () => {
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

    expect(frame.bindingsYOffset).toBeGreaterThan(0);
    expect(frame.bindings).toHaveLength(1);
    expect(frame.bindings[0].y()).toBeGreaterThanOrEqual(frame.y() + frame.bindingsYOffset);
  });

  it('does not reserve space when the frame declares no globals', () => {
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
    expect(frame.bindingsYOffset).toBe(0);
  });
});
