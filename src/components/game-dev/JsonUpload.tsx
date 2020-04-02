import * as React from 'react';

class JsonUpload extends React.Component {

  constructor(props: Readonly<{}>) {
    super(props);
    this.state ={
      file:null
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  private onFormSubmit(e: { preventDefault: () => void; }){
    e.preventDefault(); // Stop form submit
  }
  private onChange(e: { target: { files: any; }; }) {
    this.setState({file:e.target.files[0]});
  }

  public render() {
    return (
      <form onSubmit={this.onFormSubmit}>
        <h1>File Upload</h1>
        <input type="file" onChange={this.onChange} />
        <button type="submit">Upload</button>
      </form>
   );
  }
}


export default JsonUpload;