import { SpeakerDetail } from '../character/GameCharacterTypes';
import { DialogueLine } from '../dialogue/GameDialogueTypes';

/**
 * Class for keeping track of all dialogue and actions shown to the player, in sequence.
 *
 * The storage is local to the instance, and should be reset when a user completes the
 * current checkpoint.
 */
export default class GameStorageManager {
  // Storage for all dialogues to be stored
  private storage?: Array<DialogueLine>;

  // Method to be called when a dialogue needs to be stored in the current storage instance
  public storeLine(newLine: string, newSpeakerDetail?: SpeakerDetail | null) {
    if (newSpeakerDetail === undefined) return;

    if (this.storage === undefined) {
      this.storage = new Array<DialogueLine>();
    }
    const newDialogue = {
      speakerDetail: newSpeakerDetail,
      line: newLine
    };
    this.storage.push(newDialogue);
  }

  public getStorage(): Array<DialogueLine> {
    if (this.storage === undefined) {
      return new Array<DialogueLine>();
    }
    return this.storage;
  }

  public clearStorage() {
    this.storage = new Array<DialogueLine>();
  }
}
