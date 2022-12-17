import _ from 'lodash';
import React from 'react';

import { EditorTabState } from '../workspace/WorkspaceTypes';
import Editor, { EditorProps, EditorTabStateProps } from './Editor';

export type EditorContainerProps = Omit<EditorProps, keyof EditorTabStateProps> & {
  editorTabs: EditorTabStateProps[];
};

export const convertEditorTabStateToProps = (editorTab: EditorTabState): EditorTabStateProps => {
  return {
    editorValue: editorTab.value,
    ..._.pick(editorTab, 'highlightedLines', 'breakpoints', 'newCursorPosition')
  };
};

const EditorContainer: React.FC<EditorContainerProps> = (props: EditorContainerProps) => {
  const { editorTabs, ...editorProps } = props;
  // TODO: Implement editor tabs.
  return <Editor {...editorProps} {...editorTabs[0]}></Editor>;
};

export default EditorContainer;
