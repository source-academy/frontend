import { Button, MenuItem, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ItemRenderer, Select } from '@blueprintjs/select'
import * as React from 'react'

import { sourceChapters } from '../../reducers/states'
import { controlButton } from '../commons'

interface IControlBarProps {
  isRunning: boolean
  sourceChapter: number
  handleChapterSelect: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void
  handleEditorEval: () => void
  handleInterruptEval: () => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
}

export type DispatchProps = Pick<IControlBarProps, 'handleChapterSelect'> &
  Pick<IControlBarProps, 'handleEditorEval'> &
  Pick<IControlBarProps, 'handleInterruptEval'> &
  Pick<IControlBarProps, 'handleReplEval'> &
  Pick<IControlBarProps, 'handleReplOutputClear'>

export type StateProps = Pick<IControlBarProps, 'isRunning'> &
  Pick<IControlBarProps, 'sourceChapter'>

interface IChapter {
  displayName: string
  chapter: number
}

class ControlBar extends React.Component<IControlBarProps, {}> {
  public render() {
    return (
      <div className="ControlBar">
        <div className="ControlBar_editor pt-button-group">
          <Tooltip content="...or press shift-enter in the editor">
            {controlButton('Run', IconNames.PLAY, this.props.handleEditorEval)}
          </Tooltip>
          {chapterSelect(this.props.sourceChapter, this.props.handleChapterSelect)}
        </div>
        <div className="ControlBar_repl pt-button-group">
          <Tooltip content="...or press shift-enter in the REPL">
            {controlButton('Eval', IconNames.CODE, this.props.handleReplEval)}
          </Tooltip>
          {controlButton('Clear', IconNames.REMOVE, this.props.handleReplOutputClear)}
        </div>
      </div>
    )
  }
}

const chapters = sourceChapters.map(chap => ({ displayName: styliseChapter(chap), chapter: chap }))

const chapterSelect = (
  currentChap: number,
  handleSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {}
) => (
  <ChapterSelectComponent
    className="pt-minimal"
    items={chapters}
    onItemSelect={handleSelect}
    itemRenderer={chapterRenderer}
    filterable={false}
  >
    <Button
      className="pt-minimal"
      text={styliseChapter(currentChap)}
      rightIcon="double-caret-vertical"
    />
  </ChapterSelectComponent>
)

const ChapterSelectComponent = Select.ofType<IChapter>()

const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
)

function styliseChapter(chap: number) {
  return `Source \xa7${chap}`
}

export default ControlBar
