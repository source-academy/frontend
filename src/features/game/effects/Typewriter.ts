import { LineChangeFn } from '../dialogue/GameDialogueTypes';

type TypewriterProps = {
  x?: number;
  y?: number;
  textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  typeWriterInterval?: number;
};

/* Text sprite manager to produce typewriter effect */
export function Typewriter(
  scene: Phaser.Scene,
  { x = 0, y = 0, textStyle = {}, typeWriterInterval = 1 }: TypewriterProps
): [Phaser.GameObjects.Text, LineChangeFn] {
  const textSprite = new Phaser.GameObjects.Text(scene, x, y, '', textStyle);

  let line = '';
  let charPointer = 0;
  let typeWriting: NodeJS.Timeout;

  /* Reset line and type out */
  const changeLine = (message: string) => {
    if (!message) return;
    line = message;

    textSprite.text = '';
    charPointer = 0;

    typeWriting && clearInterval(typeWriting);
    typeWriting = setInterval(() => {
      textSprite.text += line[charPointer++];
      if (charPointer === line.length) {
        clearInterval(typeWriting);
      }
    }, typeWriterInterval);
  };

  return [textSprite, changeLine];
}

export default Typewriter;
