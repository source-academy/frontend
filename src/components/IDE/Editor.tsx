import * as React from 'react'

import AceEditor from 'react-ace'

import { Button, IconName, Intent } from '@blueprintjs/core'

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
  handleEditorValueChange: (newCode: string) => void
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
    const runButton = genericButton('', 'play', this.props.handleEvalEditor)
    return (
      <div className="Editor">
        <div className="row editor-control end-xs">
          <div className="col-xs-1">{runButton}</div>
        </div>
        <div className="row editor-react-ace">
          <AceEditor
            className="react-ace"
            mode="javascript"
            theme="cobalt"
            value={this.props.editorValue}
            onChange={this.props.handleEditorValueChange}
            width="100%"
            height="100%"
            fontSize={14}
            highlightActiveLine={false}
          />
        </div>
      </div>
    )
  }
}

export default Editor
