import { useCallback, useRef } from 'react';

import { useLanguageDocumentation } from '../../features/directory/useLanguageDocumentation';
import type { EditorHook } from './Editor';
import { moveCursor } from './moveCursor';
import { captureAnalysisRequest, useAnalysis } from './useAnalysis';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

type Token = { type: string; value: string } | null;

/** The page of the language's documentation for what is under the cursor, if it has one. */
function documentationUrl(languageDocsUrl: string | undefined, token: Token): string | undefined {
  if (!languageDocsUrl || token === null) {
    return undefined;
  }
  if (/\bsupport.function\b/.test(token.type) || /\bbuiltinconsts\b/.test(token.type)) {
    return `${languageDocsUrl}global.html#${token.value}`; // a builtin library name
  }
  if (/\bstorage.type\b/.test(token.type)) {
    return languageDocsUrl;
  }
  return undefined;
}

const useNavigation: EditorHook = (_inProps, _outProps, keyBindings, reactAceRef) => {
  const analysis = useAnalysis();
  const documentation = useLanguageDocumentation();
  const documentationRef = useRef(documentation);
  documentationRef.current = documentation;

  const handleNavigate = useCallback(async () => {
    if (!analysis.current?.capabilities.definition) {
      return;
    }
    const editor = reactAceRef.current?.editor;
    if (!editor) {
      return;
    }
    const request = captureAnalysisRequest(editor, analysis);
    const token = editor.session.getTokenAt(request.cursor.row, request.cursor.column);

    // Not a declaration of the program: a name of the language's library, or a keyword, goes to
    // the language's documentation. The evaluator's answer comes too late for a browser to let a
    // page open a tab (it allows that for a moment after a keypress), so the tab is opened now, and
    // either given the documentation or closed when the answer is known.
    const docsUrl = documentationUrl(documentationRef.current?.languageDocsUrl, token);
    const docsTab = docsUrl ? window.open('', '_blank') : null;
    const closeDocsTab = () => docsTab?.close();

    const declaration = await request.provider!.definition(request.code, request.position);

    // The answer is for the editor as it was asked: not for what is there now.
    if (!request.isCurrent()) {
      closeDocsTab();
      return;
    }
    if (declaration) {
      closeDocsTab();
      moveCursor(editor, { row: declaration.start.line, column: declaration.start.character });
      return;
    }
    if (docsUrl) {
      if (docsTab) {
        docsTab.location.href = docsUrl;
      } else {
        // The tab could not be reserved (a blocked popup, say): try as it was done before.
        window.open(docsUrl);
      }
    }
  }, [reactAceRef, analysis]);

  keyBindings.navigate = handleNavigate;
};

export default useNavigation;
