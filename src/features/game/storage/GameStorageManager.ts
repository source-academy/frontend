import { SpeakerDetail } from '../character/GameCharacterTypes';
import { DialogueSpeakerLine } from '../dialogue/GameDialogueTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';

/**
 * Class for keeping track of all dialogue and actions shown to the player, in sequence.
 *
 * The storage is local to the instance, and should be reset when a user completes the
 * current checkpoint.
 */
export default class GameStorageManager {
  // Storage for all dialogues to be stored
  private storage?: Array<DialogueSpeakerLine>;

  // Method to be called when a dialogue needs to be stored in the current storage instance
  public storeLine(newLine: string, newSpeakerDetail?: SpeakerDetail | null) {
    if (newSpeakerDetail === undefined) return;

    if (this.storage === undefined) {
      this.storage = new Array<DialogueSpeakerLine>();
    }
    const newDialogue = {
      speaker: this.getSpeakerName(newSpeakerDetail),
      line: newLine
    };
    this.storage.push(newDialogue);
  }

  private getSpeakerName(speakerDetail: SpeakerDetail | null) {
    const speakerId = speakerDetail?.speakerId;
    return !speakerId
      ? ''
      : speakerId === 'you'
      ? this.getUsername()
      : speakerId === 'narrator'
      ? 'Narrator'
      : GameGlobalAPI.getInstance().getCharacterById(speakerId).name;
  }

  public getStorage(): Array<DialogueSpeakerLine> {
    if (this.storage === undefined) {
      return new Array<DialogueSpeakerLine>();
    }
    return this.storage;
  }

  public clearStorage() {
    this.storage = new Array<DialogueSpeakerLine>();
  }

  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
