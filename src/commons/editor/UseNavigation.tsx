import { hasDeclaration } from 'js-slang';
import { useCallback, useRef } from 'react';

import { useLanguageDocumentation } from '../../features/directory/useLanguageDocumentation';
import type { EditorHook } from './Editor';
import { createAnalysisContext, useSourceAnalysisEnabled } from './sourceAnalysis';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useNavigation: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  const propsRef = useRef(inProps);
  propsRef.current = inProps;
  const enabled = useSourceAnalysisEnabled();
  const documentation = useLanguageDocumentation();
  const documentationRef = useRef(documentation);
  documentationRef.current = documentation;

  const handleNavigate = useCallback(() => {
    if (!enabled.current) {
      return;
    }
    const editor = reactAceRef.current!.editor;
    const pos = editor.selection.getCursor();
    const token = editor.session.getTokenAt(pos.row, pos.column);
    const { handleDeclarationNavigate } = propsRef.current;

    handleDeclarationNavigate(editor.getCursorPosition());

    const newPos = editor.selection.getCursor();
    if (newPos.row !== pos.row || newPos.column !== pos.column) {
      return;
    }

    if (
      hasDeclaration(editor.getValue(), createAnalysisContext(), {
        line: newPos.row + 1, // getCursorPosition returns 0-indexed row, function here takes in 1-indexed row
        column: newPos.column,
      })
    ) {
      return;
    }

    const languageDocsUrl = documentationRef.current?.languageDocsUrl;
    if (
      languageDocsUrl &&
      token !== null &&
      (/\bsupport.function\b/.test(token.type) || /\bbuiltinconsts\b/.test(token.type))
    ) {
      window.open(`${languageDocsUrl}global.html#${token.value}`); // opens builtin library link
    }
    if (languageDocsUrl && token !== null && /\bstorage.type\b/.test(token.type)) {
      window.open(languageDocsUrl);
    }
  }, [reactAceRef, enabled]);

  keyBindings.navigate = handleNavigate;
};

export default useNavigation;
