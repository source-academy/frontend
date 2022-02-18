import { SpeakerDetail } from '../character/GameCharacterTypes';
import { DialogueSpeakerLine } from '../dialogue/GameDialogueTypes';
import { Quest } from '../quest/GameQuestTypes';
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
  private dialogueStorage?: Array<DialogueSpeakerLine>;

  // Storage for all quests to be stored
  private questStorage?: Array<Quest>;

  // Method to be called when a dialogue needs to be stored in the current storage instance
  public storeLine(newLine: string, newSpeakerDetail?: SpeakerDetail | null) {
    if (newSpeakerDetail === undefined) return;

    if (this.dialogueStorage === undefined) {
      this.dialogueStorage = new Array<DialogueSpeakerLine>();
    }
    const newDialogue = {
      speaker: this.getSpeakerName(newSpeakerDetail),
      line: newLine
    };
    this.dialogueStorage.push(newDialogue);
  }

  public storeQuest(newQuest: Quest) {
    if (this.questStorage === undefined) {
      this.questStorage = new Array<Quest>();
    }
    this.questStorage.push(newQuest);
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
    if (this.dialogueStorage === undefined) {
      return new Array<DialogueSpeakerLine>();
    }
    return this.dialogueStorage;
  }

  public getQuestStorage(): Array<Quest> {
    if (this.questStorage === undefined) {
      return new Array<Quest>();
    }
    return this.questStorage;
  }

  // Called at the end of the chapter, when transitioning to the next checkpoint
  public clearStorage() {
    this.dialogueStorage = new Array<DialogueSpeakerLine>();
    this.questStorage = new Array<Quest>();
  }

  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
