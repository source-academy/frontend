import * as React from 'react'

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
          {controlButton('Run', 'code', () => {})}
          {controlButton('Run', 'code', () => {})}
        </div>
        <div className="ControlBar_repl pt-button-group">
          {controlButton('Eval', 'code', () => {})}
          {controlButton('Clear', 'code', () => {})}
        </div>
      </div>
    )
  }
}

export default ControlBar
