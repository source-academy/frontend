import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { screenSize } from '../commons/CommonConstants';
import { GamePosition, ItemId } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import { StateObserver } from '../state/GameStateTypes';
import { resize } from '../utils/SpriteUtils';
import CharConstants from './GameCharacterConstants';

/**
 * Manager for rendering characters in the location.
 */
export default class CharacterManager implements StateObserver {
  private characterSpriteMap: Map<ItemId, Phaser.GameObjects.Image>;

  constructor() {
    this.characterSpriteMap = new Map<ItemId, Phaser.GameObjects.Image>();
    GameGlobalAPI.getInstance().watchGameItemType(GameItemType.characters, this);
  }

  /**
   * Clear the layers, and render all the characters available to the location.
   * Will immediately be shown on the screen.
   *
   * @param locationId location in which to render characters at
   */
  public renderCharacterLayerContainer(locationId: LocationId): void {
    const idsToRender = GameGlobalAPI.getInstance().getGameItemsInLocation(
      GameItemType.characters,
      locationId
    );

    // Refresh mapping
    this.characterSpriteMap.clear();

    // Add all the characters
    idsToRender.map(id => this.handleAdd(id));
  }

  /**
   * Create the character sprite based on its ID,
   * expression, and put it at the specified location.
   *
   * @param characterId id of the character
   * @param overrideExpression expression of the shown character, optional
   * @param overridePosition position to put the character at, optional
   */
  public createCharacterSprite(
    characterId: ItemId,
    overrideExpression?: string,
    overridePosition?: GamePosition
  ) {
    const character = GameGlobalAPI.getInstance().getCharacterById(characterId);
    const { defaultPosition, defaultExpression, expressions, scale } = character;
    const characterXPosition = CharConstants.charRect.x[overridePosition || defaultPosition];
    const assetKey = expressions.get(overrideExpression || defaultExpression)!;

    const characterSprite = new Phaser.GameObjects.Image(
      GameGlobalAPI.getInstance().getGameManager(),
      characterXPosition,
      screenSize.y,
      assetKey
    ).setOrigin(0.5, 1);

    resize(characterSprite, CharConstants.charWidth * scale);
    return characterSprite;
  }

  /**
   * Add the character, specified by the ID, into the scene
   * and keep track of it within the mapping.
   *
   * @param id id of character
   * @return {boolean} true if successful, false otherwise

   */
  public handleAdd(id: ItemId): boolean {
    const characterSprite = this.createCharacterSprite(id);
    GameGlobalAPI.getInstance().addToLayer(Layer.Character, characterSprite);
    this.characterSpriteMap.set(id, characterSprite);
    return true;
  }

  /**
   * Mutate the character of the given id.
   *
   * Internally, will delete and re-add the character with
   * the updated property.
   *
   * @param id id of character
   * @return {boolean} true if successful, false otherwise

   */
  public handleMutate(id: ItemId): boolean {
    return this.handleDelete(id) && this.handleAdd(id);
  }

  /**
   * Delete the character of the given id, if
   * applicable.
   *
   * @param id id of the character
   *  @return {boolean} true if successful, false otherwise
   */
  public handleDelete(id: ItemId) {
    const char = this.characterSpriteMap.get(id);
    if (char) {
      this.characterSpriteMap.delete(id);
      char.destroy();
      return true;
    }
    return false;
  }
}
