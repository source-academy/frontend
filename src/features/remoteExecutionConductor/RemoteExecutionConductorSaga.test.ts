import { expectSaga } from 'redux-saga-test-plan';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { defaultState } from '../../commons/application/ApplicationTypes';
import { createEv3Conductor, selectedEv3EvaluatorPath } from './createEv3Conductor';
import RemoteExecutionConductorActions from './RemoteExecutionConductorActions';
import RemoteExecutionConductorSaga from './RemoteExecutionConductorSaga';

vi.mock('./createEv3Conductor', () => ({
  createEv3Conductor: vi.fn(),
  selectedEv3EvaluatorPath: vi.fn(),
}));

const client = {} as never;
const state = {
  ...defaultState,
  session: {
    ...defaultState.session,
    remoteExecutionSession: {
      workspace: 'playground',
      device: { id: 1, title: 'ev3', secret: 's', type: 'EV3' },
      connection: { status: 'CONNECTED', client, endpoint: {} },
    },
  },
};

const makeConductor = () => ({
  plugin: { run: vi.fn() },
  conduit: { terminate: vi.fn() },
});

async function run(code: string) {
  return expectSaga(RemoteExecutionConductorSaga)
    .withState(state)
    .dispatch(RemoteExecutionConductorActions.remoteExecConductorRun({ '/a': code }, '/a'))
    .silentRun(50);
}

describe('RemoteExecutionConductorSaga', () => {
  const conductors: ReturnType<typeof makeConductor>[] = [];

  beforeEach(async () => {
    // Start each test from no cached conductor.
    await expectSaga(RemoteExecutionConductorSaga)
      .dispatch(RemoteExecutionConductorActions.remoteExecConductorDisconnect())
      .silentRun(20);
    conductors.length = 0;
    vi.mocked(createEv3Conductor).mockReset();
    vi.mocked(createEv3Conductor).mockImplementation(async () => {
      const conductor = makeConductor();
      conductors.push(conductor);
      return conductor as never;
    });
    vi.mocked(selectedEv3EvaluatorPath).mockReset();
  });

  test('reuses the conductor while the selected language has the same EV3 evaluator', async () => {
    vi.mocked(selectedEv3EvaluatorPath).mockReturnValue('/python.js');
    await run('1');
    await run('2');

    expect(createEv3Conductor).toHaveBeenCalledTimes(1);
    expect(conductors[0].plugin.run).toHaveBeenCalledTimes(2);
  });

  test('builds a new conductor when the selected language has another EV3 evaluator', async () => {
    vi.mocked(selectedEv3EvaluatorPath).mockReturnValue('/python.js');
    await run('1');
    vi.mocked(selectedEv3EvaluatorPath).mockReturnValue('/other.js');
    await run('2');

    expect(createEv3Conductor).toHaveBeenCalledTimes(2);
    expect(vi.mocked(createEv3Conductor).mock.calls[1][1]).toBe('/other.js');
    expect(conductors[0].conduit.terminate).toHaveBeenCalled();
    expect(conductors[0].plugin.run).toHaveBeenCalledTimes(1);
    expect(conductors[1].plugin.run).toHaveBeenCalledTimes(1);
  });

  test('a language without an EV3 evaluator does not reach a conductor built for another', async () => {
    vi.mocked(selectedEv3EvaluatorPath).mockReturnValue('/python.js');
    await run('1');
    vi.mocked(selectedEv3EvaluatorPath).mockImplementation(() => {
      throw new Error(
        'Cannot run on the EV3: the language directory has no EV3 evaluator for Source.',
      );
    });
    const { effects } = await run('2');

    expect(conductors[0].plugin.run).toHaveBeenCalledTimes(1);
    const reported = effects.put
      .map(effect => effect.payload.action)
      .find(action => action.type === 'interpreter/evalInterpreterError');
    expect(reported.payload.errors[0].explain()).toContain('no EV3 evaluator for Source');
  });
});
