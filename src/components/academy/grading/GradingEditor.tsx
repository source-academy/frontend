import { ButtonGroup, NumericInput, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react'
import ReactMde, { ReactMdeTypes } from 'react-mde'
import * as Showdown from 'showdown'
import { controlButton } from '../../commons';

type GradingEditorProps = DispatchProps & OwnProps & StateProps

export type DispatchProps = {
  handleGradingCommentsChange: (s: string) => void
}

export type OwnProps = {
  maximumXP: number
}

export type StateProps = {
  gradingCommentsValue: string
}

type State = { 
  mdeState: ReactMdeTypes.MdeState
  XPInput: number | undefined
}

class GradingEditor extends React.Component<
  GradingEditorProps,
 State 
> {
  private converter: Showdown.Converter

  constructor(props: GradingEditorProps) {
    super(props)
    this.state = {
      mdeState: {
        markdown: this.props.gradingCommentsValue
      },
      XPInput: undefined
    }
    this.converter = new Showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
      openLinksInNewWindow: true
    })
  }

  /**
   * Update the redux state's grading comments value, using the latest
   * value in the local state.
   */
  public componentWillUnmount() {
    this.props.handleGradingCommentsChange(this.state.mdeState.markdown!)
  }

  public render() {
    return (
      <>
        <div className='grading-editor-input-parent'>
          <ButtonGroup fill={true}>
          <NumericInput 
            onValueChange={this.onXPInputChange}
            value={this.state.XPInput}
            buttonPosition={Position.LEFT} 
            placeholder='XP here'
            min={0} 
            max={this.props.maximumXP}/>
            {controlButton('Save', IconNames.FLOPPY_DISK, () => {})}
          </ButtonGroup>
        </div>
        <div className='react-mde-parent'>
          <ReactMde
            layout={'vertical'}
            onChange={this.handleValueChange}
            editorState={this.state.mdeState}
            generateMarkdownPreview={this.generateMarkdownPreview}
          />
        </div>
      </>
    )
  }

  private onXPInputChange = (newValue: number) => {
    this.setState({
      ...this.state,
      XPInput: newValue
    })
  }

  private handleValueChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({ mdeState })
  }

  private generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(this.converter.makeHtml(markdown))
}

export default GradingEditor
