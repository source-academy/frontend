import type { IChannel, IConduit } from '@sourceacademy/conductor/conduit';
import { describe, expect, test, vi } from 'vitest';

import { CseMachineHostPlugin, type CseSnapshot } from './CseMachineHostPlugin';

const snapshot = (stepIndex: number): CseSnapshot => ({
  stepIndex,
  control: [],
  stash: [],
  environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
});

function setUp() {
  let deliver!: (message: unknown) => void;
  const channel = {
    subscribe: (fn: (message: unknown) => void) => (deliver = fn),
  } as unknown as IChannel<unknown>;
  const plugin = new CseMachineHostPlugin({} as IConduit, [channel]);
  plugin.receiveSnapshots = vi.fn();
  plugin.onEnd = vi.fn();
  return { plugin, deliver: (message: unknown) => deliver(message) };
}

describe('CseMachineHostPlugin', () => {
  test('hands how a run that was sent in batches ended to onEnd', () => {
    const { plugin, deliver } = setUp();
    deliver({ type: 'snapshot-batch', index: 0, snapshots: [snapshot(0)] });
    deliver({
      type: 'snapshot-batch',
      index: 1,
      snapshots: [],
      end: { status: 'cut-off', reason: 'the limit of 2500 steps was reached' },
    });
    expect(plugin.onEnd).toHaveBeenCalledExactlyOnceWith({
      status: 'cut-off',
      reason: 'the limit of 2500 steps was reached',
    });
  });

  test('hands the snapshots so far to receiveSnapshots with each batch', () => {
    const { plugin, deliver } = setUp();
    deliver({ type: 'snapshot-batch', index: 0, snapshots: [snapshot(0), snapshot(1)] });
    deliver({ type: 'snapshot-batch', index: 2, snapshots: [snapshot(2)] });
    expect(plugin.receiveSnapshots).toHaveBeenNthCalledWith(1, expect.any(Array), []);
    expect(vi.mocked(plugin.receiveSnapshots).mock.calls[1][0]).toHaveLength(3);
  });

  test('says nothing about the end of a run that was sent whole', () => {
    const { plugin, deliver } = setUp();
    deliver({ type: 'snapshots', snapshots: [snapshot(0)], totalSteps: 1, breakpointSteps: [] });
    expect(plugin.receiveSnapshots).toHaveBeenCalledOnce();
    expect(plugin.onEnd).not.toHaveBeenCalled();
  });
});
