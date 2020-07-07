import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import CommonBackButton from '../../commons/CommonBackButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';

export default class RoomPreview extends Phaser.Scene {
  private layerManager: GameLayerManager;

  constructor() {
    super('RoomPreview');
    this.layerManager = new GameLayerManager();
  }

  public init() {
    this.layerManager.initialiseMainLayer(this);
  }

  public async preload() {
    await this.eval(`\npreload();`);
  }

  public async create() {
    this.eval(`\ncreate();`);
    const backButton = new CommonBackButton(
      this,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('MainMenu');
      },
      0,
      0
    );
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private async eval(append: string) {
    const context: Context = createContext(4, [], {}, 'gpu', {
      scene: this,
      phaser: Phaser
    });
    context.externalContext = 'playground';
    const result = await runInContext(studentCode + append, context);
    console.log(result);
  }
}

const studentCode = `import {create_text, add, load_image} from "game";
    
function preload() {
  load_image("cow", "https://source.unsplash.com/random/500x700");
}

function create(){
  let text = create_text(500,500,"cool");
  add(text);
}
`;
