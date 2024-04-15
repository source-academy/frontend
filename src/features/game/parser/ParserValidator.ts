import { ItemId } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import { GameSoundType } from '../sound/GameSoundTypes';
import Parser from './Parser';

export enum GameEntityType {
  locations = 'locations',
  objectives = 'objectives',
  tasks = 'tasks',
  bgms = 'bgms',
  sfxs = 'sfxs'
}

type AssertionDetail = {
  itemId: string;
  actionType?: string;
};

/**
 * Parser Validator has two functions:
 *
 * A. Duplicate ID checker
 * Asserts that there are no duplicated IDs in the text file
 *
 * Implementation: Keep a set of IDs declared.
 * As IDs are added onto the set, check and throw error if ID
 * is added twice onto the set.
 *
 * B. Type assertion manager
 * Assert that all the IDs used are declared somewhere in the text file.
 *
 * e.g.
 * Say make_object_glow(door) is called
 * Since make_object_glow takes in an Object Id as parameter,
 * we assert that "door" is an Object ID declared in the text.
 *
 * Implementation: Store all the assertions by type when ID is used.
 * At the end of the parsing process, verify that all type assertions exist
 * by counterchecking with items in the Checkpoint Object.
 *
 * Note the two types of assertions:
 * Game item assertions - Item ID e.g. Dialogue, Object, Bbox, Character, Action, Award
 * Game entity assertions - Entity ID e.g. Location, Bgm, Sfx, Objectives
 */
export default class ParserValidator {
  private gameItemAsserts: Map<GameItemType, AssertionDetail[]>;
  private gameEntityAsserts: Map<GameEntityType, AssertionDetail[]>;
  private gameAnimAsserts: AssertionDetail[];
  private gameAnimMaps = [
    // Game Locations Map
    Parser.checkpoint.map.getLocations(),
    // Game Object Prop Map
    Parser.checkpoint.map[GameItemType.objects]
  ];
  private allItemIds: Set<string>;

  constructor() {
    this.gameItemAsserts = new Map<GameItemType, AssertionDetail[]>();
    this.gameEntityAsserts = new Map<GameEntityType, AssertionDetail[]>();
    this.gameAnimAsserts = [];
    this.allItemIds = new Set();
  }

  ////////////////////////////
  //  Duplicate ID Checker  //
  ////////////////////////////

  /**
   * We register item id to check for possible duplicates
   * with other item ids.
   *
   * @param {string} id an object ID e.g. ItemId / Location ID / Objective ID / BGM ID / SFX ID
   */
  public registerId(id: string) {
    if (this.allItemIds.has(id)) {
      throw new Error(`Duplicate item id ${id}`);
    }
    this.allItemIds.add(id);
  }

  /////////////////////////////
  //  Type assertion manager //
  /////////////////////////////

  public verifyAssertions() {
    this.verifyGameItemAssert();
    this.verifyGameEntityAsserts();
    this.verifyGameAnimAsserts();
  }

  //////////////////////////////////////////////
  //  Type assertion manager - Game Item Type //
  //////////////////////////////////////////////

  /**
   * This function stores game item type assertions.
   *
   * @param gameItemType the attribute that the itemId needs to be
   * @param itemId the itemId that needs to be checked for validity
   * @param actionType action type e.g. make_object_glow if the assertion
   *                   was made while parsing an action
   */
  public assertItemType(gameItemType: GameItemType, itemId: ItemId, actionType?: string) {
    if (gameItemType === GameItemType.talkTopics) {
      gameItemType = GameItemType.dialogues;
    } else if (gameItemType === GameItemType.navigation) {
      gameItemType = GameItemType.locations;
    }
    if (!this.gameItemAsserts.get(gameItemType)) {
      this.gameItemAsserts.set(gameItemType, []);
    }
    this.gameItemAsserts.get(gameItemType)!.push({ itemId, actionType });
  }

  /**
   * This function verifies all game item type assertions,
   * ensuring that each ID used belongs to the correct type.
   */
  private verifyGameItemAssert() {
    this.gameItemAsserts.forEach(
      (assertionDetails: AssertionDetail[], gameItemType: GameItemType) => {
        assertionDetails.forEach((assertionDetail: AssertionDetail) => {
          const { itemId, actionType } = assertionDetail;
          // @ts-expect-error TS 5.0, violating abstraction of class and object using .has
          if (!Parser.checkpoint.map[gameItemType].has(itemId)) {
            if (actionType) {
              this.actionAssertionError(itemId, gameItemType, actionType);
            }
            throw new Error(`Cannot find id "${itemId}" under ${gameItemType} entity type`);
          }
        });
      }
    );
  }

  /**
   * Similar to assert item type, but used for asserting multiple game item types at once.
   *
   * @param gameItemType item type that the ID must be
   * @param itemIds item IDs of the item to assert
   * @param actionType action type e.g. make_object_glow if the assertion
   *                   was made while parsing an action
   */
  public assertItemTypes(gameItemType: GameItemType, itemIds: string[], actionType?: string) {
    itemIds.forEach(itemId => this.assertItemType(gameItemType, itemId, actionType));
  }

  ////////////////////////////////////////////////
  //  Type assertion manager - Game Entity Type //
  ////////////////////////////////////////////////

  /**
   * This function stores game entity type assertions.
   * ensures that 'room' is of locations type.
   *
   * @param gameEntityType the attribute that the id needs to be
   * @param id the itemId that needs to be checked for validity
   * @param actionType action type e.g. make_object_glow if the assertion
   *                   was made while parsing an action
   */
  public assertEntityType(gameEntityType: GameEntityType, id: string, actionType?: string) {
    if (!this.gameEntityAsserts.get(gameEntityType)) {
      this.gameEntityAsserts.set(gameEntityType, []);
    }
    this.gameEntityAsserts.get(gameEntityType)!.push({ itemId: id, actionType });
  }

  /**
   * This function verifies game entity assertions that have been stored.
   * ensures that 'room' is of locations type.
   *
   * @param gameEntityType the attribute that the id needs to be
   * @param id the itemId that needs to be checked for validity
   * @param actionType action type e.g. make_object_glow if the assertion
   *                   was made while parsing an action
   */
  private verifyGameEntityAsserts() {
    this.gameEntityAsserts.forEach(
      (assertionDetails: AssertionDetail[], gameEntityType: GameEntityType) => {
        assertionDetails.forEach((assertionDetail: AssertionDetail) => {
          const { itemId, actionType } = assertionDetail;
          switch (gameEntityType) {
            case GameEntityType.locations:
              Parser.checkpoint.map.getLocationAtId(itemId);
              break;

            case GameEntityType.objectives:
              if (Parser.checkpoint.objectives.getObjectives().get(itemId) === undefined) {
                if (actionType) {
                  this.actionAssertionError(itemId, gameEntityType, actionType);
                }
                throw new Error(`Cannot find objective id "${itemId}"`);
              }
              break;

            case GameEntityType.tasks:
              if (Parser.checkpoint.tasks.getAllTasks().get(itemId) === undefined) {
                if (actionType) {
                  this.actionAssertionError(itemId, gameEntityType, actionType);
                }
                throw new Error(`Cannot find task id "${itemId}"`);
              }
              break;

            case GameEntityType.bgms:
              const numberOfBgm = Parser.checkpoint.map
                .getSoundAssets()
                .filter(
                  sound => sound.soundType === GameSoundType.BGM && sound.key === itemId
                ).length;
              if (numberOfBgm === 0) {
                throw new Error(`Cannot find bgm key "${itemId}"`);
              } else if (numberOfBgm > 1) {
                throw new Error(`More than 1 bgm key "${itemId}"`);
              }
              break;

            case GameEntityType.sfxs:
              const numberOfSfx = Parser.checkpoint.map
                .getSoundAssets()
                .filter(
                  sound => sound.soundType === GameSoundType.SFX && sound.key === itemId
                ).length;
              if (numberOfSfx === 0) {
                throw new Error(`Cannot find sfx key "${itemId}"`);
              } else if (numberOfSfx > 1) {
                throw new Error(`More than 1 sfx key "${itemId}"`);
              }
              break;
          }
        });
      }
    );
  }

  //////////////////////////////////////////////
  //  Type assertion manager - Game Anim Type //
  //////////////////////////////////////////////

  /**
   * This function stores game anim type assertions.
   *
   * @param itemId id of item that needs to be checked
   * @param actionType action type e.g. start_animation
   */
  public assertAnimType(itemId: ItemId, actionType: string) {
    this.gameAnimAsserts.push({ itemId, actionType });
  }

  /**
   * This function verifies game entity assertions that have
   * been stored, by ensuring that the itemIds are declared
   * in at least one of the animation types.
   */
  private verifyGameAnimAsserts() {
    this.gameAnimAsserts.forEach((assertionDetail: AssertionDetail) => {
      const { itemId, actionType } = assertionDetail;
      let idFound = false;
      this.gameAnimMaps.forEach(map => {
        if (map.get(itemId)) {
          idFound = true;
        }
      });
      if (!idFound) {
        this.actionAssertionError(itemId, 'locationId or itemId', actionType!);
      }
    });
  }

  private actionAssertionError(itemId: string, attribute: string, actionType: string) {
    throw new Error(
      `Expected type of "${attribute}" as argument for "${actionType}", obtained "${itemId}" which is either undefined or the wrong id.`
    );
  }
}
