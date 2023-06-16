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
import EditorTabContainer from './tabs/EditorTabContainer';

type OwnProps = {
  baseFilePath?: string;
  isFolderModeEnabled: boolean;
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
    ..._.pick(editorTab, 'filePath', 'highlightedLines', 'breakpoints', 'newCursorPosition')
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
  const {
    baseFilePath,
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex,
    removeEditorTabByIndex,
    editorTabs,
    ...editorProps
  } = props;
  const createEditorTab =
    editorProps.editorVariant === 'sourcecast'
      ? createSourcecastEditorTab(editorProps)
      : createNormalEditorTab(editorProps);

  if (activeEditorTabIndex === null) {
    return (
      <div className="editor-container">
        <h1>Double click on a file in the sidebar to start editing!</h1>
      </div>
    );
  }

  // Editor tabs in workspaces which do not support Folder mode will not have associated file paths.
  const filePaths = editorTabs.map(editorTabState => editorTabState.filePath ?? 'UNKNOWN');

  return (
    <div className="editor-container">
      {isFolderModeEnabled && (
        <EditorTabContainer
          baseFilePath={baseFilePath ?? ''}
          activeEditorTabIndex={activeEditorTabIndex}
          filePaths={filePaths}
          setActiveEditorTabIndex={setActiveEditorTabIndex}
          removeEditorTabByIndex={removeEditorTabByIndex}
        />
      )}
      {createEditorTab(editorTabs[activeEditorTabIndex])}
    </div>
  );
};

export default EditorContainer;
