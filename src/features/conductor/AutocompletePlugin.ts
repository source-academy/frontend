import 'ace-builds/src-noconflict/mode-python';

import {
  AceRules,
  AutoCompleteEntry,
  BaseAutoCompleteWebPlugin,
  SyntaxHighlightData
} from '@sourceacademy/autocomplete';
import { Editor } from 'ace-builds';
import ace from 'ace-builds/src-noconflict/ace';
import { require as acequire } from 'ace-builds/src-noconflict/ace';
import { EventChannel, eventChannel, Unsubscribe } from 'redux-saga';

export default class AutoCompletePlugin extends BaseAutoCompleteWebPlugin {
  private currentMode: string | null = null;

  public getMode(): string | null {
    return this.currentMode;
  }

  loadHighlightRules(data: AceRules) {
    const oop = acequire('ace/lib/oop');
    const TextHighlightRules = acequire('ace/mode/text_highlight_rules').TextHighlightRules;
    const CustomHighlightRules = function (this: any) {
      for (const state in data) {
        data[state].forEach(rule => {
          if (
            'token' in rule &&
            typeof rule.token === 'object' &&
            'map' in rule.token &&
            !Array.isArray(rule.token)
          ) {
            const { map, defaultToken } = rule.token;
            rule.token = this.createKeywordMapper(map, defaultToken);
          }
        });
      }
      this.$rules = data;
      this.normalizeRules();
    };
    oop.inherits(CustomHighlightRules, TextHighlightRules);
    return CustomHighlightRules;
  }

  loadMode(data: SyntaxHighlightData) {
    const TextMode = acequire('ace/mode/text').Mode;
    const highlightRules = this.loadHighlightRules(data.highlightRules);
    const Mode = function (this: any) {
      this.HighlightRules = highlightRules;
      this.foldingRules = new (acequire(data.foldingRules.hookFrom).FoldMode)(
        ...data.foldingRules.args
      );
      this.$behavior = this.$defaultBehaviour;
    };

    acequire('ace/lib/oop').inherits(Mode, TextMode);
    (function (this: any) {
      this.lineCommentStart = data.lineCommentStart;
      this.pairQuotesAfter = data.pairQuotesAfter;
      this.$id = data.id;
      this.snippetFileId = data.snippetFileId;

      this.getNextLineIndent = new (acequire(data.indents.hookFrom).Mode)().getNextLineIndent;
      this.checkOutdent = new (acequire(data.outdents.hookFrom).Mode)().checkOutdent;
      this.autoOutdent = new (acequire(data.autoOutdent.hookFrom).Mode)().autoOutdent;
    }).call(Mode.prototype);

    ace.define(
      data.id,
      ['exports', 'module'],
      function (require: never, exports: { Mode: typeof Mode }) {
        exports.Mode = Mode;
      }
    );
    this.currentMode = data.id;
  }

  setMode(editor: Editor) {
    const session = editor.getSession();
    const ModeConstructor = acequire(this.currentMode || 'ace/mode/text').Mode;
    session.setMode(new ModeConstructor());
  }

  complete(code: string, row: number, column: number): EventChannel<AutoCompleteEntry[]> {
    return eventChannel<AutoCompleteEntry[]>((emit): Unsubscribe => {
      this.autocomplete(code, row, column, entries => {
        emit(entries.declarations);
      });
      return () => {};
    });
  }
}
