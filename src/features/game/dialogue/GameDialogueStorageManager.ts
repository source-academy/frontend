import { SpeakerDetail } from '../character/GameCharacterTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { DialogueStorageLine } from './GameDialogueTypes';

/**
 * Class for keeping track of all dialogue and actions shown to the player, in sequence.
 *
 * The storage is local to the instance, and should be reset when a user completes the
 * current checkpoint.
 */
export default class GameDialogueStorageManager {
  private dialogueStorage?: Array<DialogueStorageLine>;

  /**
   * Stores a line of dialogue into the current storage instance.
   * Only the dialogue line and the speaker details are passed into the method.
   *
   * @param newLine the dialogue line to be stored.
   * @param newSpeakerDetail the SpeakerDetail object that contains the speaker id.
   */
  public storeLine(newLine: string, newSpeakerDetail?: SpeakerDetail | null) {
    if (!newSpeakerDetail) return;

    if (!this.dialogueStorage) {
      this.dialogueStorage = new Array<DialogueStorageLine>();
    }
    const newDialogue = {
      speaker: this.getSpeakerName(newSpeakerDetail),
      line: newLine
    };
    this.dialogueStorage.push(newDialogue);
  }

  /**
   * Gets the speaker name from the given SpeakerDetail object, by converting the speaker id
   * stored in the SpeakerDetail object into a String containing the actual name of the Speaker,
   * using the getCharacterById method available in GameGlobalAPI.
   *
   * @param speakerDetail the SpeakerDetail object that contains the speaker id.
   *
   * @returns the speaker name corresponding to the speaker id inside the given SpeakerDetail object.
   */
  private getSpeakerName(speakerDetail: SpeakerDetail | null) {
    const speakerId = speakerDetail?.speakerId;

    // Special cases are when the id is 'you', which is converted to the player's username, and 'narrator', which simply returns 'Narrator'.
    // The getCharacterById method is primarily used to obtain the character name to be displayed on the game's dialogue box, and so the method returns '' when given 'narrator'.
    return !speakerId
      ? ''
      : speakerId === 'you'
        ? this.getUsername()
        : speakerId === 'narrator'
          ? 'Narrator'
          : GameGlobalAPI.getInstance().getCharacterById(speakerId).name;
  }

  /**
   * Clears the current iteration of the dialogue storage.
   * This method should be called at the end of the chapter, when transitioning to the next checkpoint.
   */
  public clearDialogueStorage() {
    this.dialogueStorage = new Array<DialogueStorageLine>();
  }

  /**
   * Returns the current dialogue storage as an Array of strings.
   *
   * This method is called by the Dashboard in order to fetch the dialogues currently stored,
   * and subsequently display them in order.
   *
   * @returns the Dialogue storage as an Array of strings.
   */
  public getDialogueStorage(): Array<string> {
    if (!this.dialogueStorage) {
      return new Array<string>();
    }
    return this.dialogueStorage.map(storageLine => `${storageLine.speaker}:\n${storageLine.line}`);
  }

  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
