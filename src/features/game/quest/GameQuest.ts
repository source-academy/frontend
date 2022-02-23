//import ChapterSelect from '../scenes/chapterSelect/ChapterSelect';
//import chapConstants, { chapterIndexStyle, chapterTitleStyle } from './ChapterSelectConstants';
//import GameLayerManager from '../../layer/GameLayerManager';
import SourceAcademyGame from '../SourceAcademyGame';

/**
 * The class encapsulates data on all the quests ids
 * that players CAN complete and keeps track of which
 * quests have already been completed.
 *
 * One of the components of game checkpoint.
 */
class GameQuest {
  private quest: Map<string, boolean>;
  private description: string;
  private totalNumOfQuests: number;
  private numOfCompletedQuests: number;

  constructor() {
    this.quest = new Map<string, boolean>();
    this.description = '';
    this.totalNumOfQuests = 0;
    this.numOfCompletedQuests = 0;
  }

  /**
   * Set a quest to a boolean value.
   *
   * @param key key of the quest
   * @param value boolean value to set to
   * @param desc description of the quest
   *
   */
  public setQuest(key: string, value: boolean, desc: string): void {
    const prevState = this.quest.get(key);
    this.quest.set(key, value);
    this.description = desc;
    // Handle repeated calls
    if (prevState !== undefined && prevState !== value) {
      this.numOfCompletedQuests++;
    }
  }

  /**
   * Add a quest tied to the given string.
   *
   * @param key key of the quest
   * @param desc description of the quest
   */
  public addQuest(key: string, desc: string): void {
    this.quest.set(key, false);
    this.description = desc;
    this.totalNumOfQuests++;
  }

  /**
   * Add multiple quests.
   *
   * @param keys quest keys
   * @param descriptions quest descriptions
   */
  public addQuests(keys: string[], descriptions: string[]): void {
    //keys.forEach(key => this.addQuest(key));
    let i: number = 0;
    while (i < keys.length) {
      this.addQuest(keys[i], descriptions[i]);
      i++;
    }
  }

  /**
   * Check whether all the quests are complete.
   */
  public isAllComplete(): boolean {
    return this.numOfCompletedQuests >= this.totalNumOfQuests;
  }

  /**
   * Check the state of a specific quest.
   * If quest is not present, will return undefined instead.
   *
   * @param key key of the quest
   */
  public getQuestState(key: string): boolean | undefined {
    return this.quest.get(key);
  }

  /**
   * Returns all the quests.
   */
  public getQuests() {
    return this.quest;
  }

  /** Returns description of a quest*/
  public getDescription(key: string): string | '' {
    return this.description;
  }

  /** Returns quests so far */
  public getQuestsSoFar(index: number): string[] | null {
    const questsSoFar = SourceAcademyGame.getInstance()
      .getSaveManager()
      .getChapterSaveState(index).completedQuests;
    return questsSoFar;
  }

  /**
   * Set the quest to the given parameter directly.
   *
   * @param quest map of quest keys(string) to its value (boolean)
   * @param desc description of the quest
   */
  public setQuests(quest: Map<string, boolean>, desc: string) {
    this.quest = quest;
    this.description = desc;
  }
}

export default GameQuest;
