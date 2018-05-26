import { Button, IconName, Intent } from '@blueprintjs/core'
import * as React from 'react'

import { sourceChapters } from '../../reducers/states'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IControlProps {
  isRunning: boolean
  handleEvalEditor: () => void
  handleEvalRepl: () => void
  handleClearReplOutput: () => void
  handleChapterSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
  handleInterruptEval: () => void
}

const genericButton = (
  label: string,
  icon: IconName,
  handleClick = () => {},
  intent = Intent.NONE,
  notMinimal = false
) => (
  <Button
    onClick={handleClick}
    className={(notMinimal ? '' : 'pt-minimal') + ' col-xs-12'}
    intent={intent}
    icon={icon}
  >
    {label}
  </Button>
)

const chapterSelect = (handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {}) => (
  <div className="col-xs-4 pt-select pt-select">
    <select defaultValue={sourceChapters.slice(-1)[0].toString()} onChange={handleSelect}>
      {sourceChapters.map(chap => (
        <option key={chap} value={chap}>
          {`Source \xa7${chap}`}
        </option>
      ))}
    </select>
  </div>
)

class Control extends React.Component<IControlProps, {}> {
  public render() {
    const runButton = this.props.isRunning
      ? null
      : genericButton('Run', 'play', this.props.handleEvalEditor)
    const stopButton = this.props.isRunning
      ? genericButton('Stop', 'stop', this.props.handleInterruptEval)
      : null
    const evalButton = genericButton('Eval', 'play', this.props.handleEvalRepl)
    const clearButton = genericButton('Clear', 'remove', this.props.handleClearReplOutput)
    return (
      <div className="row between-xs">
        <div className="col-xs-2">
          {runButton}
          {stopButton}
        </div>
        <div className="col-xs-4">
          <div className="row">
            {chapterSelect(this.props.handleChapterSelect)}
            <div className="col-xs-4">{evalButton}</div>
            <div className="col-xs-4">{clearButton}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Control
