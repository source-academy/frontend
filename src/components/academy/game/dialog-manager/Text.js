import { Text } from 'pixi.js'

export default class extends Text {
  /**
   * Implement an undocumented method of PIXI.Text from v3 (but not in v4)
   */
  wordWrap(text) {
    let result = '';
    let lines = text.split('\n');
    let wordWrapWidth = this._style.wordWrapWidth;
    for (let i = 0; i < lines.length; i++ ) {
      let spaceLeft = wordWrapWidth;
      let words = lines[i].split(' ');
      for (let j = 0; j < words.length; j++) {
        const wordWidth = this.context.measureText(words[j]).width;
        const wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
        if (j === 0 || wordWidthWithSpace > spaceLeft) {
          if (j > 0) {
            result += '\n';
          }
          result += words[j];
          spaceLeft = wordWrapWidth - wordWidth;
        } else {
          spaceLeft -= wordWidthWithSpace;
          result += ' ' + words[j];
        }
      }
      if (i < lines.length-1) {
        result += '\n';
      }
      return result;
    }
  };
}
