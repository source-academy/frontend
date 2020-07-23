import { ItemId } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import { GameSoundType } from '../sound/GameSoundTypes';
import Parser from './Parser';

export enum GameEntityType {
  locations = 'locations',
  objectives = 'objectives',
  bgms = 'bgms',
  sfxs = 'sfxs'
}

type AssertionDetail = {
  itemId: string;
  actionType?: string;
};

/**
 * This class acts as a validator to ensure that all the ids
 * that are used as arguments inside actions or in the txt are correct ids
 * that have been declared in other parts of the txt.
 *
 * e.g. this class ensures that if make_object_glow(door) is called,
 * "door" is an object id that as declared in 'objects' paragraph
 * somewhere in the txt.
 *
 * This helps story writers ensure the validity of their txt file
 * and also prevents game engine from running into id-not-found error
 *
 * How it works: Since the action "make_object_glow(door)" might be declared before the
 * object "door" is even declared, when the action is parsed, you can call this class
 * to store and remember the assertion that "door" must be a objectId,
 * Once the parser finishes parsing the entire txt,
 * you can run the verifyAssertions function of this class
 * to check all the assertions made is true.
 */
export default class ParserValidator {
  private gameItemAsserts: Map<GameItemType, AssertionDetail[]>;
  private gameEntityAsserts: Map<GameEntityType, AssertionDetail[]>;

  constructor() {
    this.gameItemAsserts = new Map<GameItemType, AssertionDetail[]>();
    this.gameEntityAsserts = new Map<GameEntityType, AssertionDetail[]>();
  }

  /**
   * This class stores an assertion that a certain ItemId is
   * of a certain type, e.g. assertItemType('objects', 'door')
   * ensures that 'door' is of type 'objects'
   *
   * @param gameItemType The attribute that the itemId needs to be
   * @param itemId the itemId that needs to be checked for validity
   * @param actionType Action type e.g. make_object_glow if the assertion
   *                   was made while parsing an action
   */
  public assertItemType(gameItemType: GameItemType, itemId: ItemId, actionType?: string) {
    if (!this.gameItemAsserts.get(gameItemType)) {
      this.gameItemAsserts.set(gameItemType, []);
    }
    this.gameItemAsserts.get(gameItemType)!.push({ itemId, actionType });
    return itemId;
  }

  /**
   * This class stores an assertion that a certain entity is
   * of a certain type, e.g. assert('locations', 'room')
   * ensures that 'room' is of locations type.
   *
   * @param gameEntityType The attribute that the id needs to be
   * @param id the itemId that needs to be checked for validity
   * @param actionType Action type e.g. make_object_glow if the assertion
   *                   was made while parsing an action
   */
  public assert(gameEntityType: GameEntityType, id: string, actionType?: string) {
    if (!this.gameEntityAsserts.get(gameEntityType)) {
      this.gameEntityAsserts.set(gameEntityType, []);
    }
    this.gameEntityAsserts.get(gameEntityType)!.push({ itemId: id, actionType });
    return id;
  }

  public assertItemTypes(gameItemType: GameItemType, itemIds: string[], actionType?: string) {
    itemIds.forEach(itemId => this.assertItemType(gameItemType, itemId, actionType));
  }

  public verifyAssertions() {
    this.verifyGameItemAssert();
    this.verifyGameEntityAsserts();
  }

  private verifyGameItemAssert() {
    this.gameItemAsserts.forEach(
      (assertionDetails: AssertionDetail[], gameItemType: GameItemType) => {
        assertionDetails.forEach((assertionDetail: AssertionDetail) => {
          const { itemId, actionType } = assertionDetail;
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
            case GameEntityType.bgms:
              const numberOfBgm = Parser.checkpoint.map
                .getSoundAssets()
                .filter(sound => sound.soundType === GameSoundType.BGM && sound.key === itemId)
                .length;
              if (numberOfBgm === 0) {
                throw new Error(`Cannot find bgm key "${itemId}"`);
              } else if (numberOfBgm > 1) {
                throw new Error(`More than 1 bgm key "${itemId}"`);
              }
              break;
            case GameEntityType.sfxs:
              const numberOfSfx = Parser.checkpoint.map
                .getSoundAssets()
                .filter(sound => sound.soundType === GameSoundType.SFX && sound.key === itemId)
                .length;
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

  private actionAssertionError(itemId: string, attribute: string, actionType: string) {
    throw new Error(
      `Expected type of "${attribute}" as argument for "${actionType}", obtained "${itemId}" which is either undefined or the wrong id.`
    );
  }
}
