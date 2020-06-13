import GameActionManager from 'src/features/game/action/GameActionManager';
import { screenCenter } from '../commons/CommonConstants';
import { charRect } from './CharacterConstants';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Character } from './CharacterTypes';
import { GameChapter } from '../chapter/GameChapterTypes';
// import { resize } from '../utils/SpriteUtils';
// import { Layer } from '../layer/GameLayerTypes';

export default class CharacterManager {
  private characterContainerMap: Map<LocationId, Phaser.GameObjects.Container>;
  private characterMap: Map<ItemId, Character>;

  constructor() {
    this.characterContainerMap = new Map<LocationId, Phaser.GameObjects.Container>();
    this.characterMap = new Map<ItemId, Character>();
  }

  public processCharacter(chapter: GameChapter) {
    this.characterMap = chapter.map.getCharacters();
    const locations = chapter.map.getLocations();

    locations.forEach(location => {
      const gameManager = GameActionManager.getInstance().getGameManager();
      const characterContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
      this.characterContainerMap.set(location.name, characterContainer);
      gameManager.add.existing(characterContainer);
    });
  }

  public getCharacterLayerContainer(locationId: LocationId) {
    const idsToRender =
      GameActionManager.getInstance().getLocationAttr(GameLocationAttr.characters, locationId) ||
      [];

    const characterLayer = this.renderCharactersInLoc(idsToRender, locationId);
    this.characterContainerMap.set(locationId, characterLayer);
    return this.characterContainerMap.get(locationId)!;
  }

  public renderCharactersInLoc(
    idsToRender: ItemId[],
    locationName: LocationId
  ): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    this.characterContainerMap.get(locationName)!.destroy();

    const characterContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    idsToRender.forEach(id => {
      const characterToRender = this.characterMap.get(id);
      if (characterToRender) {
        characterContainer.add(this.createCharacter(characterToRender));
      }
    });

    return characterContainer;
  }

  public createCharacter({ defaultPosition, defaultExpression, expressions }: Character) {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const characterXPosition = charRect.x[defaultPosition];
    const assetKey = expressions.get(defaultExpression)!;

    const character = new Phaser.GameObjects.Image(
      gameManager,
      characterXPosition,
      screenCenter.y,
      assetKey
    );

    return character;
  }
}
