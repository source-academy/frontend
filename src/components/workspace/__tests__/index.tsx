import * as React from 'react'

import { shallow } from 'enzyme'

import Workspace, { WorkspaceProps } from '..'
import { SideContentTab } from '../side-content'

const playgroundIntroductionTab: SideContentTab = {
  label: 'Introduction',
  icon: '',
  body: <p />
}

const listVisualizerTab: SideContentTab = {
  label: 'List Visualizer',
  icon: '',
  body: <p />
}

test('Workspace renders correctly', () => {
  const props: WorkspaceProps = {
    controlBarProps: {
      externalLibraryName: '',
      handleChapterSelect: () => {},
      handleExternalSelect: () => {},
      handleEditorEval: () => {},
      handleGenerateLz: () => {},
      handleInterruptEval: () => {},
      handleReplEval: () => {},
      handleReplOutputClear: () => {},
      hasChapterSelect: true,
      hasSaveButton: false,
      hasShareButton: true,
      isRunning: true,
      queryString: '/playground',
      questionProgress: null,
      sourceChapter: 3
    },
    editorProps: {
      editorValue: '',
      handleEditorEval: () => {},
      handleEditorValueChange: () => {}
    },
    editorWidth: '100%',
    handleEditorWidthChange: () => {},
    handleSideContentHeightChange: () => {},
    replProps: {
      output: [],
      replValue: '',
      handleBrowseHistoryDown: () => {},
      handleBrowseHistoryUp: () => {},
      handleReplEval: () => {},
      handleReplValueChange: () => {}
    },
    sideContentHeight: 10,
    sideContentProps: {
      activeTab: 0,
      handleChangeActiveTab: () => {},
      tabs: [playgroundIntroductionTab, listVisualizerTab]
    }
  }

  const app = <Workspace {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
