import { Button, MenuItem, Popover, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ItemRenderer, Select } from '@blueprintjs/select'
import * as React from 'react'

import { sourceChapters } from '../../reducers/states'
import { controlButton } from '../commons'

type ControlBarProps = DispatchProps & OwnProps & StateProps

type ControlBarState = {
  isShareOpen: boolean
}

export type DispatchProps = {
  handleChapterSelect: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void
  handleEditorEval: () => void
  handleGenerateLz: () => void
  handleInterruptEval: () => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
}

export type OwnProps = {
  hasChapterSelect?: boolean
  hasNextButton?: boolean
  hasPreviousButton?: boolean
  hasSaveButton?: boolean
  hasShareButton?: boolean
  onClickNext?(): any
  onClickPrevious?(): any
  onClickSave?(): any
}

export type StateProps = {
  isRunning: boolean
  sourceChapter: number
}

interface IChapter {
  displayName: string
  chapter: number
}

class ControlBar extends React.Component<ControlBarProps, ControlBarState> {
  public static defaultProps: OwnProps = {
    hasChapterSelect: true,
    hasNextButton: false,
    hasPreviousButton: false,
    hasSaveButton: false,
    hasShareButton: true,
    onClickNext: () => {},
    onClickPrevious: () => {},
    onClickSave: () => {}
  }

  constructor(props: ControlBarProps) {
    super(props)
    this.state = { isShareOpen: false }
  }

  public render() {
    return (
      <div className="ControlBar">
        {this.editorControl()}
        {this.flowControl()}
        {this.replControl()}
      </div>
    )
  }

  private editorControl() {
    const runButton = (
      <Tooltip content="...or press shift-enter in the editor">
        {controlButton('Run', IconNames.PLAY, this.props.handleEditorEval)}
      </Tooltip>
    )
    const stopButton = controlButton('Stop', IconNames.STOP, this.props.handleInterruptEval)
    const saveButton = this.props.hasSaveButton
      ? controlButton('Save', IconNames.FLOPPY_DISK, this.props.onClickSave)
      : undefined
    const shareButton = this.props.hasShareButton ? (
      <Popover>
        {controlButton('Share', IconNames.SHARE, this.props.handleGenerateLz)}
        The URL with hash goes here.
      </Popover>
    ) : (
      undefined
    )
    const chapterSelectButton = this.props.hasChapterSelect
      ? chapterSelect(this.props.sourceChapter, this.props.handleChapterSelect)
      : undefined
    return (
      <div className="ControlBar_editor pt-button-group">
        {this.props.isRunning ? stopButton : runButton} {saveButton}
        {shareButton} {chapterSelectButton}
      </div>
    )
  }

  private flowControl() {
    const previousButton = this.props.hasPreviousButton
      ? controlButton('Previous', IconNames.ARROW_LEFT, this.props.onClickPrevious)
      : undefined
    const nextButton = this.props.hasNextButton
      ? controlButton('Next', IconNames.ARROW_RIGHT, this.props.onClickNext, { iconOnRight: true })
      : undefined
    return (
      <div className="ControlBar_flow pt-button-group">
        {previousButton} {nextButton}
      </div>
    )
  }

  private replControl() {
    const evalButton = (
      <Tooltip content="...or press shift-enter in the REPL">
        {controlButton('Eval', IconNames.CODE, this.props.handleReplEval)}
      </Tooltip>
    )
    const clearButton = controlButton('Clear', IconNames.REMOVE, this.props.handleReplOutputClear)
    return (
      <div className="ControlBar_repl pt-button-group">
        {this.props.isRunning ? null : evalButton} {clearButton}
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
