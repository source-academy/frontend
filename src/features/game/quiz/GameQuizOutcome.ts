import GameQuizReactionManager from './GameQuizReactionManager';
import { DialogueObject } from '../dialogue/GameDialogueTypes';
export default class GameQuizOutcomeManager extends GameQuizReactionManager {
    constructor(dialogueObj : DialogueObject) {
        super(dialogueObj);
    }
}