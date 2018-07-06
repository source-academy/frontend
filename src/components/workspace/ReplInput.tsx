import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/terminal'

export interface IReplInputProps {
  replValue: string
  handleReplValueChange: (newCode: string) => void
  handleReplEval: () => void
}

class ReplInput extends React.PureComponent<IReplInputProps, {}> {
  private replInputBottom: HTMLDivElement

  public componentDidUpdate() {
    if (this.replInputBottom.clientWidth >= window.innerWidth - 50) {
      /* There is a bug where
       *   if the workspace has been resized via re-resizable such that the
       *   has disappeared off the screen, width 63
       * then
       *   calling scrollIntoView would cause the Repl to suddenly take up 100%
       *   of the screen width. This pushes the editor off-screen so that the
       *   user can no longer resize the workspace at all
       * Fix: the if condition is true when the Repl has dissapeared off-screen.
       *   (-15 to account for the scrollbar */
    } else {
      this.replInputBottom.scrollIntoView()
    }
  }

  public render() {
    return (
      <>
      <AceEditor
        className="repl-react-ace react-ace"
        mode="javascript"
        theme="cobalt"
        height="1px"
        width="100%"
        value={this.props.replValue}
        onChange={this.props.handleReplValueChange}
        commands={[
          {
            name: 'evaluate',
            bindKey: {
              win: 'Shift-Enter',
              mac: 'Shift-Enter'
            },
            exec: () => {
              this.replInputBottom.scrollIntoView()
              this.props.handleReplEval()
            }
          }
        ]}
        minLines={1}
        maxLines={20}
        fontSize={14}
        highlightActiveLine={false}
        showGutter={false}
      />
      <div className='replInputBottom' ref={e => (this.replInputBottom = e!)} />
      </>
    )
  }
}

export default ReplInput
