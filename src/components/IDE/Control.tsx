import { Button, IconName, Intent } from '@blueprintjs/core'
import * as React from 'react'

import { sourceChapters } from '../../reducers/states'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IControlProps {
  handleEvalEditor: () => void
  handleEvalRepl: () => void
  handleClearReplOutput: () => void
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

const chapterSelect = (
  <div className="col-xs-4 pt-select pt-select">
    <select defaultValue={sourceChapters.slice(-1)[0].toString()}>
      {sourceChapters.map(chap => (
        <option key={chap} value={chap}>
          {`Source ${chap}`}
        </option>
      ))}
    </select>
  </div>
)

class Control extends React.Component<IControlProps, {}> {
  public render() {
    const runButton = genericButton('Run', 'play', this.props.handleEvalEditor)
    const evalButton = genericButton('Eval', 'play', this.props.handleEvalRepl)
    const clearButton = genericButton('Clear', 'remove', this.props.handleClearReplOutput)
    return (
      <div className="row between-xs">
        <div className="col-xs-2">{runButton}</div>
        <div className="col-xs-4">
          <div className="row">
            {chapterSelect}
            <div className="col-xs-4">{evalButton}</div>
            <div className="col-xs-4">{clearButton}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Control
