import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { screenSize } from '../commons/CommonConstants';
import { GamePosition, ItemId } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import GameManager from '../scenes/gameManager/GameManager';
import { StateChangeType, StateObserver } from '../state/GameStateTypes';
import { mandatory } from '../utils/GameUtils';
import { resize } from '../utils/SpriteUtils';
import CharConstants from './GameCharacterConstants';
import { Character } from './GameCharacterTypes';

/**
 * Manager for rendering characters in the location.
 */
export default class CharacterManager implements StateObserver {
  public observerId: string;
  private characterMap: Map<ItemId, Character>;
  private characterSpriteMap: Map<ItemId, Phaser.GameObjects.Image>;

  constructor() {
    this.observerId = 'GameCharacterManager';
    this.characterMap = new Map<ItemId, Character>();
    this.characterSpriteMap = new Map<ItemId, Phaser.GameObjects.Image>();
  }

  public initialise(gameManager: GameManager) {
    this.characterMap = gameManager.getCurrentCheckpoint().map.getCharacters();
    GameGlobalAPI.getInstance().subscribeState(this);
  }

  /**
   * Part of observer pattern. Receives notification from GameStateManager.
   *
   * On notify, will rerender all the characters on the location to reflect
   * the update to the state if applicable.
   *
   * @param changeType type of change
   * @param locationId id of the location being updated
   * @param id id of item being updated
   */
  public notify(changeType: StateChangeType, locationId: LocationId, id?: string) {
    const hasUpdate = GameGlobalAPI.getInstance().hasLocationUpdateAttr(
      locationId,
      GameItemType.characters
    );
    const currLocationId = GameGlobalAPI.getInstance().getCurrLocId();
    if (hasUpdate && locationId === currLocationId) {
      // Inform state manager that update has been consumed
      GameGlobalAPI.getInstance().consumedLocationUpdate(locationId, GameItemType.characters);

      // If the update is on the current location, we rerender to reflect the update
      if (id) {
        // If Id is provided, we only need to address the specific character
        this.handleCharacterChange(changeType, id);
      } else {
        // Else, rerender the whole layer
        this.renderCharacterLayerContainer(locationId);
      }
    }
  }

  /**
   * Clear the layers, and render all the characters available to the location.
   * Will immediately be shown on the screen.
   *
   * @param locationId location in which to render characters at
   */
  public renderCharacterLayerContainer(locationId: LocationId): void {
    const idsToRender = GameGlobalAPI.getInstance().getLocationAttr(
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
    const character = this.getCharacterById(characterId);
    const { defaultPosition, defaultExpression, expressions } = character;
    const characterXPosition = CharConstants.charRect.x[overridePosition || defaultPosition];
    const assetKey = expressions.get(overrideExpression || defaultExpression)!;

    const characterSprite = new Phaser.GameObjects.Image(
      GameGlobalAPI.getInstance().getGameManager(),
      characterXPosition,
      screenSize.y,
      assetKey
    ).setOrigin(0.5, 1);

    resize(characterSprite, CharConstants.charWidth);
    return characterSprite;
  }

  /**
   * Handle change of a specific character ID.
   *
   * @param changeType type of change
   * @param id id of affected character
   */
  private handleCharacterChange(changeType: StateChangeType, id: ItemId) {
    switch (changeType) {
      case StateChangeType.Add:
        return this.handleAdd(id);
      case StateChangeType.Mutate:
        return this.handleMutate(id);
      case StateChangeType.Delete:
        return this.handleDelete(id);
    }
  }

  /**
   * Add the character, specified by the ID, into the scene
   * and keep track of it within the mapping.
   *
   * Throws error if the  character is not available
   * in the mapping.
   *
   * @param id id of character
   */
  private handleAdd(id: ItemId) {
    const characterSprite = this.createCharacterSprite(id);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Character, characterSprite);
    this.characterSpriteMap.set(id, characterSprite);
    return characterSprite;
  }

  /**
   * Mutate the character of the given id.
   *
   * Internally, will delete and re-add the character with
   * the updated property.
   *
   * @param id id of characer
   */
  private handleMutate(id: ItemId) {
    this.handleDelete(id);
    this.handleAdd(id);
  }

  /**
   * Delete the character of the given id, if
   * applicable.
   *
   * @param id id of the bbox
   */
  private handleDelete(id: ItemId) {
    const char = this.characterSpriteMap.get(id);
    if (char) char.destroy();
  }

  public getCharacterById = (charId: ItemId) => mandatory(this.characterMap.get(charId));
}
