import FontAssets from '../../assets/FontAssets';
import ImageAssets from '../../assets/ImageAssets';
import SoundAssets from '../../assets/SoundAssets';
import TextAssets from '../../assets/TextAssets';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import AwardParser from '../../parser/AwardParser';
import SourceAcademyGame from '../../SourceAcademyGame';
import { toS3Path } from '../../utils/GameUtils';
import { loadImage } from '../../utils/LoaderUtils';

/**
 * User entry point into the game.
 *
 * This is where all the fetching happens
 */
class EntryScene extends Phaser.Scene {
  constructor() {
    super('EntryScene');
  }

  public preload() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.preloadAssets();
    addLoadingScreen(this);
  }

  public async create() {
    if (SourceAcademyGame.getInstance().getAccountInfo().role === 'staff') {
      console.log('Staff do not have accounts');
      return;
    }

    await SourceAcademyGame.getInstance().loadGameChapters();
    await SourceAcademyGame.getInstance().loadRoomCode();
    await SourceAcademyGame.getInstance().getSaveManager().loadLastSaveState();
    await this.preloadAwards();

    this.applyLoadedSettings();

    this.scene.start('MainMenu');
  }

  /**
   * Load save state and settings; then applying them.
   */
  private applyLoadedSettings() {
    const userSettings = SourceAcademyGame.getInstance().getSaveManager().getSettings();
    SourceAcademyGame.getInstance().getSoundManager().applyUserSettings(userSettings);
  }

  /**
   * Fetch the awardsMapping text, set it as global variable,
   * and load all the necessary assets.
   */
  private async preloadAwards() {
    const awardsMappingTxt = this.cache.text.get(TextAssets.awardsMapping.key);
    const awardsMapping = AwardParser.parse(awardsMappingTxt);
    SourceAcademyGame.getInstance().setAwardsMapping(awardsMapping);
    await Promise.all(
      Array.from(awardsMapping.values()).map(
        async awardInfo => await loadImage(this, awardInfo.assetKey, awardInfo.assetPath)
      )
    );
  }

  /**
   * Preload all image assets, font assets, and sound assets into the game.
   */
  private preloadAssets() {
    SourceAcademyGame.getInstance().getSoundManager().loadSoundAssetMap(SoundAssets);
    Object.values(ImageAssets).forEach(asset => this.load.image(asset.key, toS3Path(asset.path)));
    Object.values(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset.key, asset.pngPath, asset.fntPath)
    );
    Object.values(TextAssets).forEach(asset => this.load.text(asset.key, asset.path));
  }
}

export default EntryScene;
