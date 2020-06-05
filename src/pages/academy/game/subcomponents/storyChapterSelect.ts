class ChapterSelect extends Phaser.Scene {
  constructor() {
    super('startGame'); /* Replace with scene key */
  }
  public preload() {}
  public create() {
    const textSprite = this.add.text(400, 300, 'Hello World in Phaser 3!', {
      fontFamily: 'Arial',
      fontSize: '30px',
      fill: '#00ff00'
    });
    textSprite.setOrigin(0.5, 0);
  }
}
export default ChapterSelect;
