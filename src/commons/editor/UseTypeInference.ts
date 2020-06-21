import { createContext, getTypeInformation } from 'js-slang';
import * as React from 'react';

import { EditorHook } from './Editor';

// EditorHook structure:
    // EditorHooks grant access to 4 things:
    // inProps are provided by the parent component
    // outProps go into the underlying React-Ace
    // keyBindings allow exporting new hotkeys
    // reactAceRef is the underlying reactAce instance for hooking.

const useTypeInference: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {

    // editorValue is the prop that is going to change all the time
    // use a ref so that the callbacks below can be memoised
    const editorValueRef = React.useRef<string>(inProps.editorValue);
    React.useEffect(() => {
    editorValueRef.current = inProps.editorValue;
    }, [inProps.editorValue]);
    

    // Dependencies go here
    const { sourceChapter, handleSendReplInputToOutput } = inProps;

    const handleTypeInferenceDisplay = React.useCallback(() => {
        const code = editorValueRef.current;
        const editor = reactAceRef.current!.editor;
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
        if (handleSendReplInputToOutput) {
          if (pos && token) {
            // if the token is a comment, ignore it
            if (token.type === 'comment') {
              return;
            }
            const str = getTypeInformation(
              code,
              createContext(sourceChapter),
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
          handleSendReplInputToOutput(output);
        }
    }, [editorValueRef, reactAceRef, handleSendReplInputToOutput, sourceChapter]);

    keyBindings.typeInferenceDisplay = handleTypeInferenceDisplay;
}

export default useTypeInference;
