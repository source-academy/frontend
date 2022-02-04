import { SpeakerDetail } from '../character/GameCharacterTypes';
import { DialogueLine } from './GameDialogueTypes';

/**
 * Class for keeping track of all dialogue shown to the player so far
 */
 export default class GameDialogueStorage {

    private storage?: Array<DialogueLine>;

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

    // public getStorage(): Array<DialogueLine> {
    //     if (this.storage === undefined) {
    //         return new Array<DialogueLine>();
    //     } 
    //     console.log(this.storage);
    //     return this.storage;
    // }
}