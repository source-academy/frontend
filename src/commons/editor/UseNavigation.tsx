import { createContext, hasDeclaration } from 'js-slang';
import * as React from 'react';
import { Links } from '../utils/Constants';

import { EditorHook } from './Editor';
import { Documentation } from '../documentation/Documentation';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useNavigation: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  // editorValue is the prop that is going to change all the time
  // use a ref so that the callbacks below can be memoised
  const editorValueRef = React.useRef<string>(inProps.editorValue);
  React.useEffect(() => {
    editorValueRef.current = inProps.editorValue;
  }, [inProps.editorValue]);

  const { sourceChapter, handleDeclarationNavigate } = inProps;
  const sourceVariant = inProps.sourceVariant === 'default' ? '' : `_${inProps.sourceVariant}`;
  const external = inProps.externalLibraryName === undefined ? 'NONE' : inProps.externalLibraryName;
  const externalUrl = inProps.externalLibraryName === 'ALL' ? `External%20libraries` : external;

  const handleNavigate = React.useCallback(() => {
    const editor = reactAceRef.current!.editor;
    const pos = editor.selection.getCursor();
    const token = editor.session.getTokenAt(pos.row, pos.column);
    const url = Links.textbook;

    const ext = Documentation.externalLibraries[external];

    handleDeclarationNavigate(editor.getCursorPosition());

    const newPos = editor.selection.getCursor();
    if (newPos.row !== pos.row || newPos.column !== pos.column) {
      return;
    }

    if (
      hasDeclaration(editorValueRef.current, createContext(sourceChapter), {
        line: newPos.row + 1, // getCursorPosition returns 0-indexed row, function here takes in 1-indexed row
        column: newPos.column
      })
    ) {
      return;
    }

    if (ext.some((node: { caption: string }) => node.caption === (token && token.value))) {
      if (
        token !== null &&
        (/\bsupport.function\b/.test(token.type) || /\bbuiltinConsts\b/.test(token.type))
      ) {
        window.open(`${url}source/${externalUrl}/global.html#${token.value}`); // opens external library link
      }
    } else if (
      token !== null &&
      (/\bsupport.function\b/.test(token.type) || /\bbuiltinconsts\b/.test(token.type))
    ) {
      window.open(
        `${url}source/source_${sourceChapter}${sourceVariant}/global.html#${token.value}`
      ); // opens builtn library link
    }
    if (token !== null && /\bstorage.type\b/.test(token.type)) {
      window.open(`${url}source/source_${sourceChapter}.pdf`);
    }
  }, [reactAceRef, sourceChapter, sourceVariant, handleDeclarationNavigate, external, externalUrl]);

  keyBindings.navigate = handleNavigate;
};

export default useNavigation;
