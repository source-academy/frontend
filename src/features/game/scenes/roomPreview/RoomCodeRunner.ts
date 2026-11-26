import type { Context } from 'js-slang';
import { createContext, runInContext } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/langs';

/**
 * Runs the code of a room, in the browser and in this page.
 *
 * This is the one place where the game is tied to a language, and it is so on purpose, and for now:
 * the code of a room is Source (§4, whatever the language that the user has selected for the
 * playground), and it runs here, in-process, with js-slang, because
 *  - it reaches the game through the `game` module, whose state holds live objects (the Phaser
 *    scene, the asset maps) that cannot be sent to an evaluator behind a message boundary, and
 *  - the scene calls the room's `update()` on every frame of the game loop, which a round trip of
 *    messages per frame could not keep up with.
 * The in-game language quests are to be overhauled, and with them this; see
 * source-academy/frontend#4632. Nothing else of the room preview names js-slang, so that this file
 * is what changes, and the allowlist of the lint rule against importing js-slang (eslint.config.js)
 * is what shows that nothing else does.
 */
export default class RoomCodeRunner {
  private readonly context: Context;

  /** @param gameState what the room's code reaches the game by: the state of the `game` module. */
  constructor(gameState: object) {
    this.context = createContext(Chapter.SOURCE_4, Variant.DEFAULT, undefined, [], 'playground');
    this.context.moduleContexts.game = { tabs: null, state: gameState };
  }

  /**
   * Runs `code` in the context of the room, which keeps what earlier code has declared. Running
   * code adds a frame to the context every time, so it is not to be done as often as the game
   * loop runs: see how `RoomPreview.update` does it.
   */
  async run(code: string): Promise<void> {
    await runInContext(code, this.context);
  }
}
