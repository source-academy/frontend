import GameModeTalk from './GameModeTalk';

class TopicListManager {
  public generateTopicList() {
    await new GameModeTalk().activateUI();
  }
}

export default TopicListManager;
