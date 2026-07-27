import 'ace-builds/src-noconflict/mode-python';

import type {
  AceRules,
  AutoCompleteEntry,
  ModeFunction,
  SyntaxHighlightData,
} from '@sourceacademy/common-autocomplete';
import type { ITabService } from '@sourceacademy/common-tabs';
import type { IChannel, IConduit } from '@sourceacademy/conductor/conduit';
import { BaseAutoCompleteWebPlugin } from '@sourceacademy/web-autocomplete';
import type { Editor } from 'ace-builds';
import ace, { require as acequire } from 'ace-builds/src-noconflict/ace';
import type { EventChannel, Unsubscribe } from 'redux-saga';
import { eventChannel } from 'redux-saga';

import { createAutocompleteModePublisher, normalizeAceModeId } from './autocompleteModeStore';

export default class AutoCompletePlugin extends BaseAutoCompleteWebPlugin {
  private currentMode: string | null = null;
  private modePublisher?: ReturnType<typeof createAutocompleteModePublisher>;

  constructor(conduit: IConduit, channels: IChannel<unknown>[], tabService: ITabService) {
    super(conduit, channels);
    this.modePublisher = createAutocompleteModePublisher(tabService);
    if (this.currentMode) {
      this.modePublisher.publish(this.currentMode);
    }
  }

  public getMode(): string | null {
    return this.currentMode;
  }

  public dispose(): void {
    this.modePublisher?.dispose();
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
    const modeId = normalizeAceModeId(data.id);
    const textMode = new TextMode();
    const loadSynchronousModeMethod = (definition: ModeFunction, method: string) => {
      if (typeof definition === 'function') {
        // Conductor RPC calls return promises, while Ace invokes these hooks synchronously.
        // Keep editing responsive with TextMode's implementation until the protocol exposes
        // a synchronous/local representation for these methods.
        console.warn(
          `Ace mode RPC function "${method}" is not synchronous; using TextMode fallback`,
        );
        return textMode[method];
      }
      return new (acequire(definition.hookFrom).Mode)()[method];
    };
    const Mode = function (this: any) {
      this.HighlightRules = highlightRules;
      this.foldingRules = new (acequire(data.foldingRules.hookFrom).FoldMode)(
        ...data.foldingRules.args,
      );
      this.$behavior = this.$defaultBehaviour;
    };

    acequire('ace/lib/oop').inherits(Mode, TextMode);
    (function (this: any) {
      this.lineCommentStart = data.lineCommentStart;
      this.pairQuotesAfter = data.pairQuotesAfter;
      this.$id = modeId;
      this.snippetFileId = data.snippetFileId;

      this.getNextLineIndent = loadSynchronousModeMethod(data.indents, 'getNextLineIndent');
      this.checkOutdent = loadSynchronousModeMethod(data.outdents, 'checkOutdent');
      this.autoOutdent = loadSynchronousModeMethod(data.autoOutdent, 'autoOutdent');
    }).call(Mode.prototype);

    ace.define(
      modeId,
      ['exports', 'module'],
      function (require: never, exports: { Mode: typeof Mode }) {
        exports.Mode = Mode;
      },
    );
    this.currentMode = modeId;
    this.modePublisher?.publish(modeId);
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
