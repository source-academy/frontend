import { Constants as c } from '../commons/CommonConstants';
import { resize } from '../utils/SpriteUtils';

type Props = {};
class Scratch extends Phaser.Scene {
  constructor() {
    super('StoryChapterSelect');
  }

  public init(data: Props) {}

  public preload() {
    this.load.text('assets', c.repoAssetsFolder + 'assets.txt');
    this.load.on('filecomplete', (key: string, file: File) => this.loadAssets(key, file));

    this.load.html('assetList', c.repoAssetsFolder + 'shops.html');
  }

  public loadAssets(key: string, file: File) {
    if (key !== 'assets') return;
    const assets = this.cache.text.get('assets').split('\n');
    console.log(assets[0]);

    const jpgAssets = ['background'];
    this.load.image('bg', c.assetsFolder + 'locations/yourRoom-dim/normal.png');
    jpgAssets.forEach(asset => this.load.image(asset, c.repoAssetsFolder + asset + '.jpg'));
    this.load.script('hello', c.repoAssetsFolder + 'hello.js');
  }

  public create() {
    this.add.dom(0, 0).createFromCache('assetList');
    const background = this.add.image(c.centerX, c.centerY, 'bg');
    resize(background, c.screenWidth, c.screenHeight);
  }
}
export default Scratch;
