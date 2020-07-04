import { loggableStyle, ICheckpointLoggable, IScreenLoggable } from './SSLogManagerTypes';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { multiplyDimensions } from 'src/features/game/utils/SpriteUtils';
import { HexColor } from 'src/features/game/utils/StyleUtils';
import { AssetPath } from 'src/features/game/commons/CommonsTypes';
import { getIdFromShortPath, padWithTab } from './SSLogManagerHelper';
import StringUtils from 'src/features/game/utils/StringUtils';
import { toIntString } from '../utils/SSUtils';

export default class SSLogManager {
  private detailMapContainer: Phaser.GameObjects.Container | undefined;
  private objectPlacement: ObjectPlacement | undefined;

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
  }

  public printCheckpoint(
    locationAssetPath: AssetPath = '/locations/yourRoom-dim/normal.png',
    checkpointLoggers: ICheckpointLoggable[]
  ) {
    const locationId = locationAssetPath === '' ? 'default' : getIdFromShortPath(locationAssetPath);

    const loggables = checkpointLoggers.map(checkpointLogger => {
      const txt = checkpointLogger.checkpointTxtLog();
      if (!txt) {
        return '';
      }
      const details = `${checkpointLogger.checkpointTitle}\n${txt
        .map(padWithTab)
        .map(padWithTab)
        .join('\n')}`;

      return details;
    });

    const checkpoint = `
startingLoc: ${locationId}

objectives
    talk

locations
    ${locationId}, ${locationAssetPath}, ${StringUtils.toCapitalizedWords(locationAssetPath)}

${locationId}
    modes: explore
    actions: show_dialogue(welcome)
${loggables.map(padWithTab).join('\n')}

dialogues
    welcome
        Congrats on creating your scene
    click
        Invisible bounding box is right here
`;
    alert('Chapter ready!');
    console.log(checkpoint);
  }

  public showDetailMap(loggables: IScreenLoggable[]) {
    this.detailMapContainer = new Phaser.GameObjects.Container(this.getObjectPlacement(), 0, 0);

    loggables.forEach((loggable: IScreenLoggable) => {
      const loggerRectangle = new Phaser.GameObjects.Rectangle(
        this.getObjectPlacement(),
        loggable.x,
        loggable.y,
        350,
        150,
        HexColor.darkBlue
      ).setAlpha(0.8);
      multiplyDimensions(loggerRectangle, 1.2);

      const loggerText = new Phaser.GameObjects.Text(
        this.getObjectPlacement(),
        loggable.x,
        loggable.y + 10,
        this.formatObjectDetails(loggable),
        loggableStyle
      ).setOrigin(0.5);
      this.detailMapContainer!.add([loggerRectangle, loggerText]);
    });
    this.getObjectPlacement().add.existing(this.detailMapContainer);
  }

  private formatObjectDetails(loggable: IScreenLoggable) {
    return Object.entries(loggable)
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === 'number' ? toIntString(value) : value.toString()}`
      )
      .join('\n');
  }

  public hideDetailMap() {
    if (this.detailMapContainer) {
      this.detailMapContainer.destroy();
    }
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }
}
