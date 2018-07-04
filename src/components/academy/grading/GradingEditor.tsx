import * as React from 'react'
import ReactMde, { ReactMdeTypes } from 'react-mde'
import * as Showdown from 'showdown';

class GradingEditor extends React.Component<{}, { mdeState: ReactMdeTypes.MdeState }> {
  private converter: Showdown.Converter;

  constructor(props: {}) {
    super(props);
    this.state = {
      mdeState: {
        markdown: 'Write your comments **here**. Feel free to use `markdown`!'
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