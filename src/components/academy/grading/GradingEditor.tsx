import * as React from 'react'
import ReactMde, { ReactMdeTypes } from 'react-mde'
import * as Showdown from 'showdown';

type GradingEditorProps = DispatchProps & StateProps

export type DispatchProps = {
  handleGradingCommentsChange: (s: string) => void
}

export type StateProps = {
  gradingCommentsValue: string
}

class GradingEditor extends React.Component<GradingEditorProps, { mdeState: ReactMdeTypes.MdeState }> {
  private converter: Showdown.Converter;

  constructor(props: GradingEditorProps) {
    super(props);
    this.state = {
      mdeState: {
        markdown: this.props.gradingCommentsValue 
      }
    }
    this.converter = new Showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
      openLinksInNewWindow: true
    });
  }

  /**
   * Update the redux state's grading comments value, using the latest
   * value in the local state.
   */
  public componentWillUnmount() {
    // TODO force non-null
    this.props.handleGradingCommentsChange(this.state.mdeState.markdown !== undefined ?  this.state.mdeState.markdown : "THIS SHOULD NOT SHOW UP" )
  }

  public render() {
    return (
      <div> 
        <ReactMde
          layout={"vertical"}
          onChange={this.handleValueChange}
          editorState={this.state.mdeState}
          generateMarkdownPreview={this.generateMarkdownPreview}
        />
      </div>
    )
  }

  private handleValueChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({ mdeState });
  };

  private generateMarkdownPreview = (markdown: string) => Promise.resolve(this.converter.makeHtml(markdown))
}


export default GradingEditor
