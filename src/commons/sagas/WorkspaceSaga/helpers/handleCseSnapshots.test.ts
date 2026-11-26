import type { IConduit } from '@sourceacademy/conductor/conduit';
import { runSaga } from 'redux-saga';
import { afterEach, describe, expect, test } from 'vitest';

import {
  CseMachineHostPlugin,
  type CseSnapshot,
} from '../../../../features/conductor/CseMachineHostPlugin';
import WorkspaceActions from '../../../workspace/WorkspaceActions';
import { handleCseSnapshots, nextRunGeneration } from './evalCode';

const snapshot = (stepIndex: number): CseSnapshot => ({
  stepIndex,
  control: [],
  stash: [],
  environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
});
const cutOff = { status: 'cut-off', reason: 'the limit of 2500 steps was reached' } as const;
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('handleCseSnapshots', () => {
  const tasks: { cancel: () => void }[] = [];
  afterEach(() => tasks.splice(0).forEach(task => task.cancel()));

  function setUp() {
    const plugin = new CseMachineHostPlugin({} as IConduit, [{ subscribe: () => {} } as never]);
    const dispatched: unknown[] = [];
    // The run that this session belongs to: the workspace's current one, until another is claimed.
    const generation = nextRunGeneration('playground');
    tasks.push(
      runSaga(
        { dispatch: (action: unknown) => dispatched.push(action), getState: () => ({}) },
        handleCseSnapshots,
        plugin,
        'playground',
        generation,
      ),
    );
    return { plugin, dispatched };
  }

  test('puts the snapshots and the end of the current run into the workspace', async () => {
    const { plugin, dispatched } = setUp();
    plugin.receiveSnapshots([snapshot(0), snapshot(1)], [1]);
    plugin.onEnd(cutOff);
    await tick();
    expect(dispatched).toContainEqual(
      WorkspaceActions.updateCseSnapshots([snapshot(0), snapshot(1)], 'playground'),
    );
    expect(dispatched).toContainEqual(WorkspaceActions.updateCseEnd(cutOff, 'playground'));
  });

  test('ignores what the session of a superseded run sends: its end', async () => {
    const { plugin, dispatched } = setUp();
    // Another run starts, while this session is still being torn down and still subscribed.
    nextRunGeneration('playground');
    plugin.onEnd(cutOff);
    await tick();
    expect(dispatched).toEqual([]);
  });

  test('ignores what the session of a superseded run sends: its snapshots', async () => {
    const { plugin, dispatched } = setUp();
    nextRunGeneration('playground');
    plugin.receiveSnapshots([snapshot(0)], []);
    await tick();
    expect(dispatched).toEqual([]);
  });

  test('a run of another workspace does not supersede it', async () => {
    const { plugin, dispatched } = setUp();
    nextRunGeneration('sicp');
    plugin.onEnd(cutOff);
    await tick();
    expect(dispatched).toContainEqual(WorkspaceActions.updateCseEnd(cutOff, 'playground'));
  });
});
