import * as React from 'react';

class JsonUpload extends React.Component {
  private static onFormSubmit(e: { preventDefault: () => void; }){
    e.preventDefault(); // Stop form submit
  }

  constructor(props: Readonly<{}>) {
    super(props);
    this.state ={
      file:null
    };
    JsonUpload.onFormSubmit = JsonUpload.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  public render() {
    return (
      <form onSubmit={JsonUpload.onFormSubmit}>
        <h3>Json File Upload</h3>
        <input type="file" onChange={this.onChange} style={{width: "250px"}}/>
        <button type="submit">Upload</button>
      </form>
    );
  }
  private onChange(e: { target: { files: any; }; }) {
    this.setState({file:e.target.files[0]});
  }
}


export default JsonUpload;
