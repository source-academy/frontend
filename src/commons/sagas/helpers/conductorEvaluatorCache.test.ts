import type { IConduit } from '@sourceacademy/conductor/conduit';
import { runSaga } from 'redux-saga';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../../features/conductor/createConductor', () => ({
  createConductor: vi.fn(),
}));

import { createConductor } from '../../../features/conductor/createConductor';
import { DeferredConductorTabService } from '../../../features/conductor/deferredConductorTabService';
import { getPreparedConductorSaga, preloadConductorEvaluatorSaga } from './conductorEvaluatorCache';

type FakeConductor = {
  hostPlugin: object;
  csePlugin: object;
  conduit: IConduit & {
    terminate: ReturnType<typeof vi.fn>;
    lookupPlugin: ReturnType<typeof vi.fn>;
  };
  moduleLoaderPlugin: { onModuleDirectoryURLChange: ReturnType<typeof vi.fn> };
};

function makeFakeConductor(): FakeConductor {
  const conduit = {
    terminate: vi.fn(),
    lookupPlugin: vi.fn(() => {
      throw new Error('plugin not registered on this fake conduit');
    }),
  } as unknown as FakeConductor['conduit'];
  return {
    hostPlugin: {},
    csePlugin: {},
    conduit,
    moduleLoaderPlugin: { onModuleDirectoryURLChange: vi.fn(async () => {}) },
  };
}

const createConductorMock = createConductor as unknown as ReturnType<typeof vi.fn>;

// Queues the next fake conductor that createConductor() will return, in call order - tests that race
// two concurrent conductor creations queue one call per expected createConductor() invocation, in the
// order those invocations actually happen (which is not always textual call order - see the
// session-race test below).
function mockCreateConductorOnce(): FakeConductor {
  const fake = makeFakeConductor();
  createConductorMock.mockReturnValueOnce(fake);
  return fake;
}

function makeEnv(getLanguageId: () => string | null) {
  return {
    dispatch: () => {},
    getState: () => ({
      languageDirectory: { selectedLanguageId: getLanguageId() },
      featureFlags: { modifiedFlags: {} },
    }),
  };
}

describe('conductorEvaluatorCache', () => {
  beforeEach(() => {
    createConductorMock.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, blob: async () => new Blob() }) as unknown as Response),
    );
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:fake'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('selecting the same evaluator path twice within a session reuses the identical conductor', async () => {
    const languageId = 'lang-reuse';
    const env = makeEnv(() => languageId);
    mockCreateConductorOnce();

    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator.mjs').toPromise();
    const first = await runSaga(env, getPreparedConductorSaga, undefined).toPromise();
    const second = await runSaga(env, getPreparedConductorSaga, undefined).toPromise();

    expect(second.conduit).toBe(first.conduit);
    expect(createConductorMock).toHaveBeenCalledTimes(1);
  });

  test('a consumed conductor is reused for display, but a second Run gets a different instance', async () => {
    const languageId = 'lang-consume';
    const env = makeEnv(() => languageId);
    const first = mockCreateConductorOnce();

    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator.mjs').toPromise();
    const runResult = await runSaga(env, getPreparedConductorSaga, { consume: true }).toPromise();
    expect(runResult.conduit).toBe(first.conduit);

    // Re-selecting the same evaluator (e.g. clicking back into a tab it owns) must reuse the same,
    // now-consumed instance rather than rebuilding - its tabs are what's already on screen.
    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator.mjs').toPromise();
    expect(createConductorMock).toHaveBeenCalledTimes(1);

    // A second real Run must not reuse the already-consumed instance - evalCode.ts's own teardown
    // already killed its Worker unconditionally after the first run.
    const second = mockCreateConductorOnce();
    const secondRun = await runSaga(env, getPreparedConductorSaga, { consume: true }).toPromise();
    expect(secondRun.conduit).toBe(second.conduit);
    expect(secondRun.conduit).not.toBe(first.conduit);
  });

  test('switching language ids tears down every conductor from the old session', async () => {
    let languageId = 'lang-old';
    const env = makeEnv(() => languageId);
    const unregisterAllSpy = vi.spyOn(DeferredConductorTabService.prototype, 'unregisterAll');
    const conductorA = mockCreateConductorOnce();

    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator-a.mjs').toPromise();
    expect(conductorA.conduit.terminate).not.toHaveBeenCalled();

    languageId = 'lang-new';
    mockCreateConductorOnce();
    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator-b.mjs').toPromise();

    // The old session's only conductor is torn down completely: tabs unregistered and conduit
    // terminated, even though it was never explicitly consumed by a Run.
    expect(unregisterAllSpy).toHaveBeenCalled();
    expect(conductorA.conduit.terminate).toHaveBeenCalled();
  });

  test('a conductor whose creation resolves after a session switch is discarded, not adopted', async () => {
    let languageId = 'lang-race-old';
    const env = makeEnv(() => languageId);
    let abandonedConductor: FakeConductor | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (path: string) => {
        if (path === '/evaluator-race.mjs') {
          // The session ends - a language switch - while this evaluator's own creation is still
          // mid-flight (this fetch hasn't even resolved yet, so its own conductor doesn't exist).
          // The new session's own selection is driven to completion first (so its createConductor
          // call is queued and consumed before this one's), then this fetch itself resolves,
          // letting the abandoned creation catch up afterward.
          languageId = 'lang-race-new';
          mockCreateConductorOnce();
          await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator-b.mjs').toPromise();
          abandonedConductor = mockCreateConductorOnce();
        }
        return { ok: true, blob: async () => new Blob() } as unknown as Response;
      }),
    );

    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator-race.mjs').toPromise();

    expect(abandonedConductor).toBeDefined();
    expect(abandonedConductor!.conduit.terminate).toHaveBeenCalled();
  });

  test('a conductor whose conduit.terminate() throws still gets its tabs unregistered', async () => {
    let languageId = 'lang-throw-old';
    const env = makeEnv(() => languageId);
    const conductor = mockCreateConductorOnce();
    conductor.conduit.terminate.mockImplementation(() => {
      throw new Error('Conduit already terminated');
    });

    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator-throw.mjs').toPromise();
    const unregisterAllSpy = vi.spyOn(DeferredConductorTabService.prototype, 'unregisterAll');

    languageId = 'lang-throw-new';
    mockCreateConductorOnce();
    // Must resolve cleanly despite the throw inside teardown - this is the exact bug the rewrite
    // fixes: the pre-rewrite code awaited conduit.terminate() before unregistering tabs, so this
    // throw used to prevent unregisterAll() from ever running.
    await runSaga(env, preloadConductorEvaluatorSaga, '/evaluator-b.mjs').toPromise();

    expect(conductor.conduit.terminate).toHaveBeenCalled();
    expect(unregisterAllSpy).toHaveBeenCalled();
  });
});
