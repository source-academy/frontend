// import GameActionManager from 'src/features/game/action/GameActionManager';

class TypeWriterCopy {}

export default TypeWriterCopy;
// export default class Typewriter {
//   private line: string;
//   private charPointer: 0;
//   private timer: NodeJS.Timeout | undefined;
//   private container: Phaser.GameObjects.Container | undefined;
//   private textSprite: Phaser.GameObjects.Text | undefined;

//   constructor(x: number, y: number, textStyle: object) {
//     this.line = '';
//     this.charPointer = 0;
//     this.timer = undefined;
//   }

//   public getContainer() {
//     const gameManager = GameActionManager.getInstance().getGameManager();

//     this.container = new Phaser.GameObjects.Container(gameManager, 0, 0);

//     this.textSprite = new Phaser.GameObjects.Text(gameManager, 0, 0, '', textStyle);
//     this.container.add(this.textSprite);
//     return this.container;
//   }

//   public printLine(message: string) {
//     if (!message || !this.textSprite) {
//       return;
//     }

//     this.line = message;

//     this.textSprite.text = '';
//     this.charPointer = 0;

//     this.timer && clearInterval(this.timer);
//     this.timer = setInterval(() => {
//       if (!this.textSprite) {
//         return;
//       }
//       this.textSprite.text += this.line[this.charPointer++];
//       if (this.charPointer === this.line.length && !this.timer) {
//         clearInterval(this.timer);
//       }
//     }, 1);
//   }
// }
