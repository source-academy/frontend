import { createContext, hasDeclaration } from 'js-slang';
import { Variant } from 'js-slang/dist/types';
import React from 'react';

import { Documentation } from '../documentation/Documentation';
import { Links } from '../utils/Constants';
import { EditorHook } from './Editor';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useNavigation: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  const propsRef = React.useRef(inProps);
  propsRef.current = inProps;

  const handleNavigate = React.useCallback(() => {
    const editor = reactAceRef.current!.editor;
    const pos = editor.selection.getCursor();
    const token = editor.session.getTokenAt(pos.row, pos.column);
    const { sourceChapter, handleDeclarationNavigate } = propsRef.current;

    handleDeclarationNavigate(editor.getCursorPosition());

    const newPos = editor.selection.getCursor();
    if (newPos.row !== pos.row || newPos.column !== pos.column) {
      return;
    }

    if (
      hasDeclaration(editor.getValue(), createContext(sourceChapter), {
        line: newPos.row + 1, // getCursorPosition returns 0-indexed row, function here takes in 1-indexed row
        column: newPos.column
      })
    ) {
      return;
    }

    const url = Links.sourceDocs;
    const sourceVariant =
      propsRef.current.sourceVariant === Variant.DEFAULT
        ? ''
        : `_${propsRef.current.sourceVariant}`;
    const external =
      propsRef.current.externalLibraryName === undefined
        ? 'NONE'
        : propsRef.current.externalLibraryName;
    const externalUrl =
      propsRef.current.externalLibraryName === 'ALL' ? `External%20libraries` : external;
    const ext = Documentation.externalLibraries[external];

    if (ext.some((node: { caption: string }) => node.caption === (token && token.value))) {
      if (
        token !== null &&
        (/\bsupport.function\b/.test(token.type) || /\bbuiltinconsts\b/.test(token.type))
      ) {
        window.open(`${url}${externalUrl}/global.html#${token.value}`); // opens external library link
      }
    } else if (
      token !== null &&
      (/\bsupport.function\b/.test(token.type) || /\bbuiltinconsts\b/.test(token.type))
    ) {
      window.open(`${url}source_${sourceChapter}${sourceVariant}/global.html#${token.value}`); // opens builtn library link
    }
    if (token !== null && /\bstorage.type\b/.test(token.type)) {
      window.open(`${url}source_${sourceChapter}.pdf`);
    }
  }, [reactAceRef]);

  keyBindings.navigate = handleNavigate;
};

export default useNavigation;
