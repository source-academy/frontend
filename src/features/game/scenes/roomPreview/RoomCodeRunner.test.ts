import { createContext, runInContext } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/langs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import RoomCodeRunner from './RoomCodeRunner';

vi.mock('js-slang', () => ({
  createContext: vi.fn(() => ({ moduleContexts: {} })),
  runInContext: vi.fn(async () => ({ status: 'finished' })),
}));

describe('RoomCodeRunner', () => {
  beforeEach(() => {
    vi.mocked(createContext).mockClear();
    vi.mocked(runInContext).mockClear();
  });

  test('is Source §4 whatever the language that the user has selected', () => {
    new RoomCodeRunner({});
    expect(createContext).toHaveBeenCalledWith(
      Chapter.SOURCE_4,
      Variant.DEFAULT,
      undefined,
      [],
      'playground',
    );
  });

  test('gives the code of the room the game by the state of the game module', () => {
    const state = { scene: {}, screenSize: { x: 1, y: 2 } };
    new RoomCodeRunner(state);
    const context = vi.mocked(createContext).mock.results[0].value as {
      moduleContexts: Record<string, unknown>;
    };
    expect(context.moduleContexts.game).toEqual({ tabs: null, state });
    expect((context.moduleContexts.game as { state: unknown }).state).toBe(state);
  });

  test('runs code in the one context of the room, which keeps what earlier code declared', async () => {
    const runner = new RoomCodeRunner({});
    const context = vi.mocked(createContext).mock.results[0].value;

    await runner.run('const a = 1;');
    await runner.run('update();');

    expect(createContext).toHaveBeenCalledTimes(1);
    expect(vi.mocked(runInContext).mock.calls).toEqual([
      ['const a = 1;', context],
      ['update();', context],
    ]);
  });

  test('each runner has a context of its own', () => {
    new RoomCodeRunner({});
    new RoomCodeRunner({});
    expect(createContext).toHaveBeenCalledTimes(2);
  });
});
