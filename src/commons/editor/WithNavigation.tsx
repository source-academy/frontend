import { EditorBase, Constructor } from './Editor';
import { createContext, hasDeclaration } from 'js-slang';

import { Links } from '../utils/Constants';
import { Documentation } from '../documentation/Documentation';

function WithNavigation<C extends Constructor<EditorBase>>(Editor: C) {
  return class extends Editor {
    // TODO: No documentation of what the function is supposed to do.
    // Related PR: https://github.com/source-academy/cadet-frontend/pull/1028
    public handleNavigate = () => {
      const chapter = this.props.sourceChapter;
      const variantString =
        this.props.sourceVariant === 'default' ? '' : `_${this.props.sourceVariant}`;
      const pos = this.AceEditor.current!.editor.selection.getCursor();
      const token = this.AceEditor.current!.editor.session.getTokenAt(pos.row, pos.column);
      const url = Links.textbook;

      const external =
        this.props.externalLibraryName === undefined ? 'NONE' : this.props.externalLibraryName;
      const externalUrl =
        this.props.externalLibraryName === 'ALL' ? `External%20libraries` : external;
      const ext = Documentation.externalLibraries[external];

      this.props.handleDeclarationNavigate(this.AceEditor.current!.editor.getCursorPosition());

      const newPos = this.AceEditor.current!.editor.selection.getCursor();
      if (newPos.row !== pos.row || newPos.column !== pos.column) {
        return;
      }

      if (
        hasDeclaration(this.props.editorValue, createContext(chapter), {
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
        window.open(`${url}source/source_${chapter}${variantString}/global.html#${token.value}`); // opens builtn library link
      }
      if (token !== null && /\bstorage.type\b/.test(token.type)) {
        window.open(`${url}source/source_${chapter}.pdf`);
      }
    };
  };
}

export default WithNavigation;
