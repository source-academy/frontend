import { ICheckpointLogger, IScreenLoggable, loggableStyle } from './SSLogManagerTypes';
import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { multiplyDimensions } from 'src/features/game/utils/SpriteUtils';
import { toIntString } from '../utils/SSUtils';
import { hex, Color } from 'src/features/game/utils/StyleUtils';

export default class SSLogManager {
  private detailMapContainer: Phaser.GameObjects.Container | undefined;
  private objectPlacement: ObjectPlacement | undefined;

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
  }

  public printDetailMap(checkpointLoggers: ICheckpointLogger[]) {
    console.log(
      checkpointLoggers
        .map(checkpointLogger => {
          const txt = checkpointLogger.checkpointTxtLog();
          return txt ? `<<${checkpointLogger.checkpointTitle}>>\n\n` + txt : '';
        })
        .join('\n\n')
    );
  }

  public showDetailMap(loggables: IScreenLoggable[]) {
    this.detailMapContainer = new Phaser.GameObjects.Container(this.getObjectPlacement(), 0, 0);
    loggables.forEach((loggable: IScreenLoggable) => {
      const rect = new Phaser.GameObjects.Rectangle(
        this.getObjectPlacement(),
        loggable.x,
        loggable.y,
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
