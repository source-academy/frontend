import { SpeakerDetail } from '../character/GameCharacterTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { DialogueSpeakerLine } from './GameDialogueTypes';

/**
 * Class for keeping track of all dialogue and actions shown to the player, in sequence.
 *
 * The storage is local to the instance, and should be reset when a user completes the
 * current checkpoint.
 */
export default class GameDialogueStorageManager {
  // Storage for all dialogues to be stored
  private dialogueStorage?: Array<DialogueSpeakerLine>;

  // Method to be called when a dialogue needs to be stored in the current storage instance
  public storeLine(newLine: string, newSpeakerDetail?: SpeakerDetail | null) {
    if (!newSpeakerDetail) return;

    if (!this.dialogueStorage) {
      this.dialogueStorage = new Array<DialogueSpeakerLine>();
    }
    const newDialogue = {
      speaker: this.getSpeakerName(newSpeakerDetail),
      line: newLine
    };
    this.dialogueStorage.push(newDialogue);
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

  public getDialogueStorage(): Array<DialogueSpeakerLine> {
    if (!this.dialogueStorage) {
      return new Array<DialogueSpeakerLine>();
    }
    return this.dialogueStorage;
  }

  // Called at the end of the chapter, when transitioning to the next checkpoint
  public clearDialogueStorage() {
    this.dialogueStorage = new Array<DialogueSpeakerLine>();
  }

  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
