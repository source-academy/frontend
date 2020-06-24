import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';

class StorySimulatorTransition extends Phaser.Scene {
  constructor() {
    super('StorySimulatorTransition');
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

export default StorySimulatorTransition;
