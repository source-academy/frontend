import * as React from 'react'

import { Button, IconName, Intent } from '@blueprintjs/core'

import { sourceChapters } from '../../reducers/states'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IReplControlProps {
  handleReplEval: () => void
  handleReplOutputClear: () => void
  handleChapterSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const chapterSelect = (handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {}) => (
  <div className="pt-select pt-select">
    <select defaultValue={sourceChapters.slice(-1)[0].toString()} onChange={handleSelect}>
      {sourceChapters.map(chap => (
        <option key={chap} value={chap}>
          {`Source \xa7${chap}`}
        </option>
      ))}
    </select>
  </div>
)

class ReplControl extends React.Component<IReplControlProps, {}> {
  public render() {
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
    const evalButton = genericButton('', 'code', this.props.handleReplEval)
    const clearButton = genericButton('', 'remove', this.props.handleReplOutputClear)
    return (
      <div className="row end-xs">
        <div className="pt-control-group pt-fill">
          {chapterSelect(this.props.handleChapterSelect)}
          {evalButton}
          {clearButton}
        </div>
      </div>
    )
  }
}

export default ReplControl
