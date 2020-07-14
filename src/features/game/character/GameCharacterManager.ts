import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import { screenSize } from '../commons/CommonConstants';
import { GamePosition,ItemId } from '../commons/CommonTypes';
import { fadeIn, fadeOut } from '../effects/FadeEffect';
import { Layer } from '../layer/GameLayerTypes';
import { GameLocationAttr,LocationId } from '../location/GameMapTypes';
import GameManager from '../scenes/gameManager/GameManager';
import { mandatory } from '../utils/GameUtils';
import { resize } from '../utils/SpriteUtils';
import CharConstants from './GameCharacterConstants';
import { Character } from './GameCharacterTypes';

export default class CharacterManager {
  private characterMap: Map<ItemId, Character>;
  private characterSpriteMap: Map<ItemId, Phaser.GameObjects.Image>;

  constructor() {
    this.characterMap = new Map<ItemId, Character>();
    this.characterSpriteMap = new Map<ItemId, Phaser.GameObjects.Image>();
  }

  public initialise(gameManager: GameManager) {
    this.characterMap = gameManager.getCurrentCheckpoint().map.getCharacters();
  }

  public renderCharacterLayerContainer(locationId: LocationId): void {
    const idsToRender = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.characters,
      locationId
    );
    const characterLayer = this.getCharacterContainer(idsToRender);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Character, characterLayer);
  }

  public getCharacterContainer(idsToRender: ItemId[]): Phaser.GameObjects.Container {
    const characterContainer = new Phaser.GameObjects.Container(
      GameGlobalAPI.getInstance().getGameManager(),
      0,
      0
    );

    idsToRender.forEach(id => {
      const characterSprite = this.createCharacterSprite(id);
      characterContainer.add(characterSprite);
      this.characterSpriteMap.set(id, characterSprite);
    });

    return characterContainer;
  }

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

  public showCharacterOnMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      GameGlobalAPI.getInstance()
        .getGameManager()
        .add.tween(fadeIn([characterSprite]));
    }
  }

  public hideCharacterFromMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      GameGlobalAPI.getInstance()
        .getGameManager()
        .add.tween(fadeOut([characterSprite]));
    }
  }

  public getCharacterById = (charId: ItemId) =>
    mandatory(this.characterMap.get(charId)) as Character;
}
