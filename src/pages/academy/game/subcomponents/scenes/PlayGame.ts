import { Constants as c } from '../utils/constants';
import { PhaserScene } from '../utils/extendedPhaser';

class PlayGame extends PhaserScene {
  constructor() {
    super('storyChapterSelect');
  }

  public init() {}

  public preload() {
    this.load.text('assets', c.repoAssetsFolder + 'assets.txt');
    this.load.on('filecomplete', (key: string, file: File) => this.loadAssets(key, file), this);
  }

  public loadAssets(key: string, file: File) {
    if (key !== 'assets') return;
    // const assets = this.cache.text.get('assets').split('\n');
    // const jpgAssets = ['background'];
    // this.load.image('bg', c.assetsFolder + 'locations/yourRoom-dim/normal.png');
    // jpgAssets.forEach(asset => this.load.image(asset, c.repoAssetsFolder + asset + '.jpg'));
    // this.load.script('hello', c.repoAssetsFolder + 'hello.js');
  }

  public create() {
    this.add.dom(0, 0).createFromCache('assetList');
    this.addImage(c.centerX, c.centerY, 'bg').resize(c.screenWidth, c.screenHeight);
  }
}
export default PlayGame;
