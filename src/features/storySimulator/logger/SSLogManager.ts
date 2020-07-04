import { ICheckpointLogger, IScreenLoggable, loggableStyle } from './SSLogManagerTypes';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { multiplyDimensions } from 'src/features/game/utils/SpriteUtils';
import { toIntString } from '../utils/SSUtils';
import { hex, Color } from 'src/features/game/utils/StyleUtils';
import { AssetPath } from 'src/features/game/commons/CommonsTypes';
import { getIdFromShortPath } from './SSLogManagerHelper';
import { LocationId } from 'src/features/game/location/GameMapTypes';
import StringUtils from 'src/features/game/utils/StringUtils';

export default class SSLogManager {
  private detailMapContainer: Phaser.GameObjects.Container | undefined;
  private objectPlacement: ObjectPlacement | undefined;

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
  }

  public printDetailMap(locationAssetPath: AssetPath = '', checkpointLoggers: ICheckpointLogger[]) {
    const locationId = locationAssetPath === '' ? 'default' : getIdFromShortPath(locationAssetPath);

    const configLog = `<<configuration>>\nstartingLoc: ${locationId}`;
    const locationLog = this.createLocationLog(locationId, locationAssetPath);

    const loggables = checkpointLoggers.map(checkpointLogger => {
      const txt = checkpointLogger.checkpointTxtLog();
      if (!txt) {
        return '';
      }
      const details = `<<${checkpointLogger.checkpointTitle}>>\n[${locationId}]\n` + txt;
      return details;
    });

    const sampleDialogue = `<<dialogue1>>\ntitle: None\n[part0]\nCongrats on making your scene`;
    const sampleObjectives = `<<objectives>>\nfinishGame`;

    console.log(
      [configLog, locationLog, ...loggables, sampleDialogue, sampleObjectives].join('\n\n')
    );
  }

  private createLocationLog(locationId: LocationId, locationAssetPath: AssetPath) {
    const header = `<<locations>>`;
    const locationAsset = `${locationId}, ${locationAssetPath}, ${StringUtils.toCapitalizedWords(
      locationAssetPath
    )}`;
    const modes = `$\n${locationId}: explore`;
    const navigability = `$\n${locationId}: otherLocation1, otherLocation2`;
    const actions = `$\n${locationId}, bringUpDialogue: dialogue1`;

    return [header, locationAsset, modes, navigability, actions].join('\n');
  }

  public showDetailMap(loggables: IScreenLoggable[]) {
    this.detailMapContainer = new Phaser.GameObjects.Container(this.getObjectPlacement(), 0, 0);
    loggables.forEach((loggable: IScreenLoggable) => {
      const rect = new Phaser.GameObjects.Rectangle(
        this.getObjectPlacement(),
        loggable.x,
        loggable.y,
        350,
        150,
        hex(Color.darkBlue)
      ).setAlpha(0.8);
      multiplyDimensions(rect, 1.2);
      const mapShowText = new Phaser.GameObjects.Text(
        this.getObjectPlacement(),
        loggable.x,
        loggable.y + 10,
        this.formatObjectDetails(loggable),
        loggableStyle
      ).setOrigin(0.5);
      this.detailMapContainer!.add([rect, mapShowText]);
    });
    this.getObjectPlacement().add.existing(this.detailMapContainer);
  }

  private formatObjectDetails(loggable: IScreenLoggable) {
    const numberAttributes = ['x', 'y', 'width', 'height'];

    let message = '';

    if (loggable['assetPath']) {
      message += loggable['assetPath'] + '\n';
    }

    message += numberAttributes
      .map(numberAttribute =>
        loggable[numberAttribute]
          ? `${numberAttribute}: ${toIntString(loggable[numberAttribute])}`
          : ''
      )
      .join('\n');

    return message;
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
