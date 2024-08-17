/**
 * @typedef {TypewriterProps} - properties describing a typewriter
 *
 * @prop {number} x - x coordinate of the left edge of the typewriter
 * @prop {number} y - y coordinate of the top edge of the typewriter
 * @prop {Phaser.Types.GameObjects.Text.TextStyle} textStyle
 *       the text config to specify the text propertoes of the typewriter text
 * @prop {number} typeWriterInterval - how long is the interval between
 *                                     each letter's appearance
 */
type TypewriterProps = {
  x?: number;
  y?: number;
  textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  typeWriterInterval?: number;
};

/**
 * Text sprite manager to produce typewriter effect
 *
 * @param scene - scene to add the typewriter sprite
 * @param typeWriterProps - properties to describe the appearance and animation of the typewriter
 */
export function Typewriter(
  scene: Phaser.Scene,
  { x = 0, y = 0, textStyle = {}, typeWriterInterval = 1 }: TypewriterProps
) {
  const textSprite = new Phaser.GameObjects.Text(scene, x, y, '', textStyle);

  let line = '';
  let charPointer = 0;
  let typeWriting: NodeJS.Timeout;

  const clearTyping = () => {
    if (typeWriting) {
      clearInterval(typeWriting);
    }
  };

  /* Reset line and type out */
  const changeLine = (message: string) => {
    if (!message) return;
    line = message;

    textSprite.text = '';
    charPointer = 0;

    clearTyping();
    typeWriting = setInterval(() => {
      textSprite.text += line[charPointer++];
      if (charPointer === line.length) {
        clearInterval(typeWriting);
      }
    }, typeWriterInterval);
  };

  return { container: textSprite, changeLine, clearTyping };
}

export default Typewriter;
