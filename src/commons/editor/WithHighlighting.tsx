import { EditorBase, Constructor } from './Editor';
import { Ace } from 'ace-builds';
import AceRange from './EditorAceRange';
import { createContext, getAllOccurrencesInScope, getScope } from 'js-slang';

function WithHighlighting<C extends Constructor<EditorBase>>(Editor: C) {
  return class extends Editor {
    private markerIds: number[] = [];

    public componentDidMount() {
      super.componentDidMount();
      this.injectedRenderProps['onCursorChange'] = this.handleVariableHighlighting;
      this.handleVariableHighlighting();
    }

    protected onChange(newCode: string, delta: Ace.Delta) {
      super.onChange(newCode, delta);
      this.handleVariableHighlighting();
    }

    protected handleVariableHighlighting = () => {
      // using Ace Editor's way of highlighting as seen here: https://github.com/ajaxorg/ace/blob/master/lib/ace/editor.js#L497
      // We use async blocks so we don't block the browser during editing

      setTimeout(() => {
        if (!this.AceEditor || !this.AceEditor.current || !this.AceEditor.current.editor) {
          return;
        }
        const editor = (this.AceEditor.current as any).editor;
        const session = editor.session;
        const code = this.props.editorValue;
        const chapterNumber = this.props.sourceChapter;
        const position = editor.getCursorPosition();
        if (!session || !session.bgTokenizer) {
          return;
        }
        this.markerIds.forEach(id => {
          session.removeMarker(id);
        });
        const ranges = getAllOccurrencesInScope(code, createContext(chapterNumber), {
          line: position.row + 1,
          column: position.column
        }).map(
          loc =>
            new AceRange(loc.start.line - 1, loc.start.column, loc.end.line - 1, loc.end.column)
        );

        const markerType = 'ace_variable_highlighting';
        const markerIds = ranges.map(range => {
          // returns the marker ID for removal later
          return session.addMarker(range, markerType, 'text');
        });
        this.markerIds = markerIds;
      }, 10);
    };

    public handleHighlightScope = () => {
      const editor = this.AceEditor.current!.editor;
      if (!editor) {
        return;
      }
      const code = this.props.editorValue;
      const chapter = this.props.sourceChapter;
      const position = editor.getCursorPosition();

      const ranges = getScope(code, createContext(chapter), {
        line: position.row + 1,
        column: position.column
      });

      if (ranges.length !== 0) {
        ranges.forEach(range => {
          // Highlight the scope ranges
          this.markerIds.push(
            editor.session.addMarker(
              new AceRange(
                range.start.line - 1,
                range.start.column,
                range.end.line - 1,
                range.end.column
              ),
              'ace_selection',
              'text'
            )
          );
        });
      }
    };
  };
}

export default WithHighlighting;
