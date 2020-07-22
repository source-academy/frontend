import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { screenSize } from '../commons/CommonConstants';
import { GamePosition, ItemId } from '../commons/CommonTypes';
import { fadeIn, fadeOut } from '../effects/FadeEffect';
import { Layer } from '../layer/GameLayerTypes';
import { GameLocationAttr, LocationId } from '../location/GameMapTypes';
import GameManager from '../scenes/gameManager/GameManager';
import { StateObserver } from '../state/GameStateTypes';
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
    this.observerId = 'GameObjectManager';
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
   * On notify, will rerender all the objects on the location to reflect
   * the update to the state if applicable.
   *
   * @param locationId id of the location being updated
   */
  public notify(locationId: LocationId) {
    // TODO: Inquire on correct attributes
    const hasUpdate = true;
    const currLocationId = GameGlobalAPI.getInstance().getCurrLocId();
    if (hasUpdate && locationId === currLocationId) {
      // If the update is on the current location, we rerender to reflect the update
      this.renderCharacterLayerContainer(locationId);
    }
  }

  /**
   * Create a container filled with the characters related to the itemIDs.
   *
   * @param objectIds object IDs to be created
   */
  private createCharacterContainer(charIds: ItemId[]): Phaser.GameObjects.Container {
    const characterContainer = new Phaser.GameObjects.Container(
      GameGlobalAPI.getInstance().getGameManager(),
      0,
      0
    );

    charIds.forEach(id => {
      const characterSprite = this.createCharacterSprite(id);
      characterContainer.add(characterSprite);
      this.characterSpriteMap.set(id, characterSprite);
    });

    return characterContainer;
  }

  /**
   * Clear the layers, and render all the characters available to the location.
   * Will immediately be shown on the screen.
   *
   * @param locationId location in which to render bboxes at
   */
  public renderCharacterLayerContainer(locationId: LocationId): void {
    const idsToRender = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.characters,
      locationId
    );
    const characterLayer = this.createCharacterContainer(idsToRender);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Character, characterLayer);
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
   * Show a character by fading in the character into the screen.
   * Assumes that the character is already added to the scene.
   *
   * @param characterId
   */
  public showCharacterOnMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      GameGlobalAPI.getInstance()
        .getGameManager()
        .add.tween(fadeIn([characterSprite]));
    }
  }

  /**
   * Hide a character by fading out the character from the screen.
   * Assumes that the character is already added to the scene.
   * Does NOT remove the character from the scene.
   *
   * @param characterId
   */
  public hideCharacterFromMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      GameGlobalAPI.getInstance()
        .getGameManager()
        .add.tween(fadeOut([characterSprite]));
    }
  }

  public getCharacterById = (charId: ItemId) => mandatory(this.characterMap.get(charId));
}
