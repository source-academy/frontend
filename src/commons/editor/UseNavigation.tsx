import { useCallback, useRef } from 'react';

import { useLanguageDocumentation } from '../../features/directory/useLanguageDocumentation';
import type { EditorHook } from './Editor';
import { moveCursor } from './moveCursor';
import { useAnalysis } from './useAnalysis';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useNavigation: EditorHook = (_inProps, _outProps, keyBindings, reactAceRef) => {
  const analysis = useAnalysis();
  const documentation = useLanguageDocumentation();
  const documentationRef = useRef(documentation);
  documentationRef.current = documentation;

  const handleNavigate = useCallback(async () => {
    const provider = analysis.current;
    if (!provider?.capabilities.definition) {
      return;
    }
    const editor = reactAceRef.current?.editor;
    if (!editor) {
      return;
    }
    const code = editor.getValue();
    const pos = editor.getCursorPosition();
    const token = editor.session.getTokenAt(pos.row, pos.column);

    const declaration = await provider.definition(code, { line: pos.row, character: pos.column });

    // The answer is for the code and the cursor of the request: not for what is there now.
    const now = editor.getCursorPosition();
    if (editor.getValue() !== code || now.row !== pos.row || now.column !== pos.column) {
      return;
    }
    if (declaration) {
      moveCursor(editor, { row: declaration.start.line, column: declaration.start.character });
      return;
    }

    // Not a declaration of the program: a name of the language's library, or a keyword, goes to
    // the language's documentation.
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
  }, [reactAceRef, analysis]);

  keyBindings.navigate = handleNavigate;
};

export default useNavigation;
