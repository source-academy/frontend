import * as React from 'react'

import { sourceChapters } from '../../reducers/states'
import { controlButton } from '../commons'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IReplControlProps {
  handleReplEval: () => void
  handleReplOutputClear: () => void
  handleChapterSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

class ReplControl extends React.Component<IReplControlProps, {}> {
  public render() {
    return (
      <div className="row end-xs">
        <div className="pt-control-group pt-fill">
          {chapterSelect(this.props.handleChapterSelect)}
          {controlButton('', 'code', this.props.handleReplEval)}
          {controlButton('', 'remove', this.props.handleReplOutputClear)}
        </div>
      </div>
    )
  }
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

export default ReplControl
