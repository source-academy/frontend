import { describe, expect, test, vi } from 'vitest';

import SourceAcademyGame from '../SourceAcademyGame';
import { callGameManagerOnTxtLoad } from './TxtLoaderUtils';

// Phaser's file loader only adds a loaded text asset to the cache when its contents
// are truthy (see `File.addToCache` in phaser/src/loader/File.js), so a genuinely
// empty (0-byte) text file loads successfully but `scene.cache.text.get()` for it
// returns undefined instead of ''. This mock scene reproduces exactly that: every
// load "succeeds" (mirrors Phaser firing `filecomplete` regardless), but the cache
// only actually holds an entry for keys with non-empty content.
function createMockScene(cacheContents: Record<string, string>) {
  return {
    cache: {
      text: {
        exists: () => false,
        get: (key: string) => cacheContents[key],
      },
    },
    load: {
      text: vi.fn(),
      once: (_event: string, callback: () => void) => callback(),
      start: vi.fn(),
    },
    scene: {
      start: vi.fn(),
    },
  };
}

describe('callGameManagerOnTxtLoad', () => {
  test('does not crash when the default checkpoint text asset loaded empty', async () => {
    const chapterFilename = 'https://example.com/stories/chapter0.txt';
    const scene = createMockScene({
      // 'default-chap' is intentionally absent: an empty defaultCheckpoint.txt on S3
      // loads with a 200 but is never cached by Phaser, so the lookup misses.
      [chapterFilename]: 'objectives\n    objectiveDone\n',
    });

    vi.spyOn(SourceAcademyGame, 'getInstance').mockReturnValue({
      getIsUsingMock: () => false,
      getCurrentSceneRef: () => scene,
      getGameChapters: () => [{ filenames: [chapterFilename] }],
    } as unknown as SourceAcademyGame);

    await expect(callGameManagerOnTxtLoad(true, 0, 0)).resolves.toBeUndefined();

    expect(scene.scene.start).toHaveBeenCalledWith('GameManager', {
      gameCheckpoint: expect.anything(),
      continueGame: true,
      chapterNum: 0,
      checkpointNum: 0,
    });
  });
});
