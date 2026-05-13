import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

export const SOURCE_MONACO_THEME = 'source';

const aceSourceColors = {
  activeLineBackground: '#00000059',
  autocompleteActiveLineBackground: '#495A6B',
  autocompleteBackground: '#2C3E50',
  bracketMatchBackground: '#009900',
  cursor: '#FFFFFF',
  // These are the visible Ace editor surface colors from _workspace.scss.
  editorBackground: '#2C3E50',
  foreground: '#FFFFFF',
  gutterBackground: '#34495E',
  invisibleForeground: '#FFFFFF26',
  lineNumberForeground: '#8091A0',
  printMarginBackground: '#555555',
  selectionBackground: '#B36539BF',
  widgetBorder: '#555555'
} as const;

type MonacoEnvironmentGlobal = typeof globalThis & {
  MonacoEnvironment?: {
    getWorker: (_moduleId: string, label: string) => Worker;
  };
};

(self as MonacoEnvironmentGlobal).MonacoEnvironment = {
  getWorker: () => {
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
      type: 'module'
    });
  }
};

const sourceTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: aceSourceColors.foreground.slice(1) },
    { token: 'comment', foreground: '0088FF', fontStyle: 'italic' },
    { token: 'constant', foreground: 'FF628C' },
    { token: 'keyword', foreground: 'FF9D00' },
    { token: 'number', foreground: 'FF628C' },
    { token: 'string', foreground: 'FF628C' },
    { token: 'type', foreground: 'FFEE80' },
    { token: 'variable', foreground: 'CCCCCC' }
  ],
  colors: {
    'editor.background': aceSourceColors.editorBackground,
    'editor.foreground': aceSourceColors.foreground,
    'editorCursor.foreground': aceSourceColors.cursor,
    'editorGutter.background': aceSourceColors.gutterBackground,
    'editorLineNumber.foreground': aceSourceColors.lineNumberForeground,
    'editorLineNumber.activeForeground': '#C8E4FD',
    'editor.selectionBackground': aceSourceColors.selectionBackground,
    'editor.wordHighlightBorder': aceSourceColors.selectionBackground,
    'editor.lineHighlightBackground': aceSourceColors.activeLineBackground,
    'editor.lineHighlightBorder': '#00000000',
    'editorRuler.foreground': aceSourceColors.printMarginBackground,
    'editorWhitespace.foreground': aceSourceColors.invisibleForeground,
    'editorIndentGuide.background1': '#334A60',
    'editorIndentGuide.activeBackground1': aceSourceColors.lineNumberForeground,
    'editorBracketMatch.background': aceSourceColors.bracketMatchBackground,
    'editorBracketMatch.border': aceSourceColors.bracketMatchBackground,
    'editorWidget.background': aceSourceColors.autocompleteBackground,
    'editorWidget.border': aceSourceColors.widgetBorder,
    'editorHoverWidget.background': aceSourceColors.autocompleteActiveLineBackground,
    'editorHoverWidget.border': aceSourceColors.widgetBorder,
    'editorSuggestWidget.background': aceSourceColors.autocompleteBackground,
    'editorSuggestWidget.border': aceSourceColors.widgetBorder,
    'editorSuggestWidget.foreground': aceSourceColors.foreground,
    'editorSuggestWidget.highlightForeground': '#FF9D00',
    'editorSuggestWidget.selectedBackground': aceSourceColors.autocompleteActiveLineBackground,
    'editorSuggestWidget.selectedForeground': aceSourceColors.foreground,
    'editorSuggestWidget.focusHighlightForeground': '#FF9D00',
    'editorSuggestWidgetStatus.foreground': '#CED9E0',
    'scrollbarSlider.background': '#6B839A66',
    'scrollbarSlider.hoverBackground': '#6B839A99',
    'scrollbarSlider.activeBackground': '#6B839ACC'
  }
};

monaco.editor.defineTheme(SOURCE_MONACO_THEME, sourceTheme);
monaco.editor.setTheme(SOURCE_MONACO_THEME);

loader.config({ monaco });
