import { Button, MenuItem } from '@blueprintjs/core'
import { ItemRenderer, Select } from '@blueprintjs/select'
import * as React from 'react'
import AceEditor from 'react-ace'

import { sourceChapters } from '../../reducers/states'
import { controlButton } from '../commons'

import 'brace/mode/javascript'
import 'brace/theme/cobalt'

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IEditorProps {
  editorValue: string
  isRunning: boolean
  sourceChapter: number
  handleChapterSelect: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void
  handleEditorValueChange: (newCode: string) => void
  handleEditorEval: () => void
  handleInterruptEval: () => void
}

export interface IChapter {
  displayName: string
  chapter: number
}

const chapters = sourceChapters.map(chap => ({ displayName: styliseChapter(chap), chapter: chap }))

class Editor extends React.Component<IEditorProps, {}> {
  public render() {
    const runButton = this.props.isRunning
      ? null
      : controlButton('', 'play', this.props.handleEditorEval)
    const stopButton = this.props.isRunning
      ? controlButton('', 'stop', this.props.handleInterruptEval)
      : null
    return (
      <div className="Editor">
        <div className="row editor-control start-xs">
          <div className="col-xs-6">
            {chapterSelect(this.props.sourceChapter, this.props.handleChapterSelect)}
            {runButton}
            {stopButton}
          </div>
        </div>
        <div className="row editor-react-ace">
          <AceEditor
            className="react-ace"
            mode="javascript"
            theme="cobalt"
            value={this.props.editorValue}
            onChange={this.props.handleEditorValueChange}
            height="100%"
            width="100%"
            fontSize={14}
            highlightActiveLine={false}
          />
        </div>
      </div>
    )
  }
}

const chapterSelect = (
  currentChap: number,
  handleSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {}
) => (
  <ChapterSelectComponent
    items={chapters}
    onItemSelect={handleSelect}
    itemRenderer={chapterRenderer}
    filterable={false}
  >
    <Button text={styliseChapter(currentChap)} rightIcon="double-caret-vertical" />
  </ChapterSelectComponent>
)

const ChapterSelectComponent = Select.ofType<IChapter>()

const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
)

function styliseChapter(chap: number) {
  return `Source \xa7${chap}`
}

export default Editor
