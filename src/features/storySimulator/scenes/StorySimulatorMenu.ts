import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';

class StorySimulatorMenu extends Phaser.Scene {
  constructor() {
    super('StorySimulatorMenu');
  }

  public async preload() {
    addLoadingScreen(this);
    const accountInfo = getStorySimulatorGame().getAccountInfo();
    if (!accountInfo) {
      console.log('No account info');
      return;
    }
  }
}

export default StorySimulatorMenu;
