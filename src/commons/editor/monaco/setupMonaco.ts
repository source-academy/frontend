import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

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

monaco.editor.defineTheme('source', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'FFFFFF' },
    { token: 'comment', foreground: '0088FF', fontStyle: 'italic' },
    { token: 'constant', foreground: 'FF628C' },
    { token: 'keyword', foreground: 'FF9D00' },
    { token: 'number', foreground: 'FF628C' },
    { token: 'string', foreground: 'FF628C' },
    { token: 'type', foreground: 'FFEE80' },
    { token: 'variable', foreground: 'CCCCCC' }
  ],
  colors: {
    'editor.background': '#002240',
    'editor.foreground': '#FFFFFF',
    'editorCursor.foreground': '#FFFFFF',
    'editorGutter.background': '#011e3a',
    'editorLineNumber.foreground': '#8091A0',
    'editorLineNumber.activeForeground': '#C8E4FD',
    'editor.selectionBackground': '#B36539BF',
    'editor.wordHighlightBorder': '#B36539BF',
    'editor.lineHighlightBackground': '#00000059',
    'editorIndentGuide.background1': '#334A60',
    'editorIndentGuide.activeBackground1': '#8091A0',
    'editorBracketMatch.background': '#009900',
    'editorBracketMatch.border': '#009900',
    'scrollbarSlider.background': '#6B839A66',
    'scrollbarSlider.hoverBackground': '#6B839A99',
    'scrollbarSlider.activeBackground': '#6B839ACC'
  }
});

loader.config({ monaco });
