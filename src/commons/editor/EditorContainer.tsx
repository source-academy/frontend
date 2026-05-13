import _ from 'lodash';
import { lazy, Suspense, useContext } from 'react';
import { flagMonacoEditorEnable } from 'src/features/monaco/flagMonacoEditorEnable';

import { useFeature } from '../featureFlags/useFeature';
import type { EditorTabState } from '../workspace/WorkspaceTypes';
import { WorkspaceSettingsContext } from '../WorkspaceSettingsContext';
import Editor, { type EditorProps, type EditorTabStateProps } from './Editor';
import EditorTabContainer from './tabs/EditorTabContainer';

const MonacoEditor = lazy(() => import('./MonacoEditor'));

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

export type EditorContainerProps = NormalEditorContainerProps;

export const convertEditorTabStateToProps = (
  editorTab: EditorTabState,
  editorTabIndex: number,
): EditorTabStateProps => {
  return {
    editorTabIndex,
    editorValue: editorTab.value,
    ..._.pick(editorTab, 'filePath', 'highlightedLines', 'breakpoints', 'newCursorPosition'),
  };
};

const createNormalEditorTab =
  (editorProps: Omit<EditorProps, keyof EditorTabStateProps>, useMonacoEditor: boolean) =>
  (editorTabStateProps: EditorTabStateProps) => {
    const editorPropsWithTab = { ...editorProps, ...editorTabStateProps };
    return useMonacoEditor ? (
      <Suspense fallback={null}>
        <MonacoEditor {...editorPropsWithTab} />
      </Suspense>
    ) : (
      <Editor {...editorPropsWithTab} />
    );
  };

const EditorContainer: React.FC<EditorContainerProps> = (props: EditorContainerProps) => {
  const [workspaceSettings] = useContext(WorkspaceSettingsContext)!;
  const useMonacoEditor = useFeature(flagMonacoEditorEnable);
  const {
    baseFilePath,
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex,
    removeEditorTabByIndex,
    editorTabs,
    ...editorProps
  } = props;
  editorProps.editorBinding = workspaceSettings.editorBinding;

  const createEditorTab = createNormalEditorTab(editorProps, useMonacoEditor);

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
