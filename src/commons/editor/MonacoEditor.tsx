import './monaco/setupMonaco';

import { Card } from '@blueprintjs/core';
import MonacoReactEditor from '@monaco-editor/react';
import { useCallback } from 'react';

import { EditorProps } from './Editor';

const languageByExtension: Record<string, string> = {
  c: 'c',
  cc: 'cpp',
  cpp: 'cpp',
  css: 'css',
  h: 'cpp',
  html: 'html',
  java: 'java',
  js: 'javascript',
  json: 'json',
  jsx: 'javascript',
  py: 'python',
  ts: 'typescript',
  tsx: 'typescript'
};

const getLanguage = ({ filePath, mode }: Pick<EditorProps, 'filePath' | 'mode'>): string => {
  if (mode) {
    return mode;
  }
  const extension = filePath?.split('.').pop()?.toLowerCase();
  return (extension && languageByExtension[extension]) || 'javascript';
};

const MonacoEditor: React.FC<EditorProps> = props => {
  const handleChange = useCallback(
    (value: string | undefined, event: unknown) => {
      const newValue = value ?? '';
      props.handleEditorValueChange(props.editorTabIndex, newValue);
      props.handleUpdateHasUnsavedChanges?.(true);
      props.onChange?.(newValue, event);
    },
    [props]
  );

  return (
    <Card className="Editor">
      <div className="row editor-react-ace" data-testid="Editor" id="editor-react-ace">
        <MonacoReactEditor
          className="react-ace"
          height="100%"
          language={getLanguage(props)}
          onChange={handleChange}
          options={{
            /* acceptSuggestionOnEnter: 'off', */
            fontFamily: "'Inconsolata', 'Consolas', monospace",
            fontSize: 17,
            hover: { enabled: false },
            minimap: { enabled: false },
            /* parameterHints: { enabled: false }, */
            /* quickSuggestions: false, */
            readOnly: props.sessionDetails?.readOnly ?? false,
            scrollBeyondLastLine: false,
            /* suggestOnTriggerCharacters: false, */
            /* tabCompletion: 'off', */
            /* wordBasedSuggestions: 'off' */
          }}
          theme="source"
          value={props.editorValue}
          width="100%"
        />
      </div>
    </Card>
  );
};

export default MonacoEditor;
