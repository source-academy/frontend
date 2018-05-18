import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/github'

import { Button, IconName, Intent } from '@blueprintjs/core'

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IEditorProps {
  editorValue: string
  handleEditorChange: (newCode: string) => void
  handleEvalEditor: () => void
}

class Editor extends React.Component<IEditorProps, {}> {
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
    const runButton = genericButton('Run', 'play', this.props.handleEvalEditor)
    return (
      <>
        {runButton}
        <AceEditor
          mode="javascript"
          theme="github"
          value={this.props.editorValue}
          onChange={this.props.handleEditorChange}
          className="col-xs-6"
        />
      </>
    )
  }
}

export default Editor
