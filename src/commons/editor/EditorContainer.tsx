// Necessary to prevent "ReferenceError: ace is not defined" error.
// See https://github.com/securingsincity/react-ace/issues/1233 (although there is no explanation).
import 'ace-builds/src-noconflict/ace';

import _ from 'lodash';
import React from 'react';

import SourcecastEditor, {
  SourceRecorderEditorProps
} from '../sourceRecorder/SourceRecorderEditor';
import { EditorTabState } from '../workspace/WorkspaceTypes';
import Editor, { EditorProps, EditorTabStateProps } from './Editor';

type OwnProps = {
  isMultipleFilesEnabled: boolean;
  activeEditorTabIndex: number | null;
  setActiveEditorTabIndex: (activeEditorTabIndex: number | null) => void;
  removeEditorTabByIndex: (editorTabIndex: number) => void;
  editorTabs: EditorTabStateProps[];
};

export type NormalEditorContainerProps = Omit<EditorProps, keyof EditorTabStateProps> &
  OwnProps & {
    editorVariant: 'normal';
  };

export type SourcecastEditorContainerProps = Omit<
  SourceRecorderEditorProps,
  keyof EditorTabStateProps
> &
  OwnProps & {
    editorVariant: 'sourcecast';
  };

export type EditorContainerProps = NormalEditorContainerProps | SourcecastEditorContainerProps;

export const convertEditorTabStateToProps = (
  editorTab: EditorTabState,
  editorTabIndex: number
): EditorTabStateProps => {
  return {
    editorTabIndex,
    editorValue: editorTab.value,
    ..._.pick(editorTab, 'highlightedLines', 'breakpoints', 'newCursorPosition')
  };
};

const createNormalEditorTab =
  (editorProps: Omit<EditorProps, keyof EditorTabStateProps>) =>
  (editorTabStateProps: EditorTabStateProps) => {
    return <Editor {...editorProps} {...editorTabStateProps} />;
  };

const createSourcecastEditorTab =
  (editorProps: Omit<SourceRecorderEditorProps, keyof EditorTabStateProps>) =>
  (editorTabStateProps: EditorTabStateProps) => {
    return <SourcecastEditor {...editorProps} {...editorTabStateProps} />;
  };

const EditorContainer: React.FC<EditorContainerProps> = (props: EditorContainerProps) => {
  const { isMultipleFilesEnabled, activeEditorTabIndex, editorTabs, ...editorProps } = props;
  const createEditorTab =
    editorProps.editorVariant === 'sourcecast'
      ? createSourcecastEditorTab(editorProps)
      : createNormalEditorTab(editorProps);

  if (activeEditorTabIndex === null) {
    // TODO: Handle the case where there are no editor tabs.
    return <></>;
  }

  return createEditorTab(editorTabs[activeEditorTabIndex]);
};

export default EditorContainer;
