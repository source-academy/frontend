import { EditorBase, Constructor } from './Editor';
import { createContext, getTypeInformation } from 'js-slang';

function WithTypeInference<C extends Constructor<EditorBase>>(Editor: C) {
  return class extends Editor {
    public handleTypeInferenceDisplay = (): void => {
      const chapter = this.props.sourceChapter;
      const code = this.props.editorValue;
      const editor = this.AceEditor.current!.editor;
      const pos = editor.getCursorPosition();
      const token = editor.session.getTokenAt(pos.row, pos.column);

      // comment out everyline of the inference string returned by getTypeInformation
      const commentEveryLine = (str: string) => {
        const arr = str.split('\n');
        return arr
          .filter(st => st !== '')
          .map(st => '// ' + st)
          .join('\n');
      };

      let output;

      // display the information
      if (this.props.handleSendReplInputToOutput) {
        if (pos && token) {
          // if the token is a comment, ignore it
          if (token.type === 'comment') {
            return;
          }
          const str = getTypeInformation(
            code,
            createContext(chapter),
            { line: pos.row + 1, column: pos.column },
            token.value
          );
          output = commentEveryLine(str);
          if (str.length === 0) {
            output = '// type information not found';
          }
        } else {
          output = '// invalid token. Please put cursor on an identifier.';
        }
        this.props.handleSendReplInputToOutput(output);
      }
    };
  };
}

export default WithTypeInference;
