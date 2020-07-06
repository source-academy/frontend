import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';

export default class RoomPreview extends Phaser.Scene {
  constructor() {
    super('RoomPreview');
  }

  public async preload() {

    await this.eval(`\npreload();`);
  }

  public async create() {
    this.eval(`\ncreate();`)
  }

  private async eval(append: string) {
    const context: Context = createContext(4, [], {}, 'gpu', {
      scene: this,
      phaser: Phaser
    });
    context.externalContext = 'playground';
    await runInContext(studentCode + append, context);
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
`
