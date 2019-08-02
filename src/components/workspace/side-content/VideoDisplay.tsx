import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import { controlButton } from '../../commons';

interface IState {
  width: string;
  height: string;
}

class VideoDisplay extends React.Component<{}, IState> {
  private $video: HTMLElement | null;
  private $canvas: HTMLElement | null;
  constructor(props: any) {
    super(props);
    this.state = {
      height: (window as any)._HEIGHT.toString(),
      width: (window as any)._WIDTH.toString()
    };
    this.handleUpdateDimensions = this.handleUpdateDimensions.bind(this);
    this.handleWidthChange = this.handleWidthChange.bind(this);
    this.handleHeightChange = this.handleHeightChange.bind(this);
  }
  public componentDidMount() {
    if (this.$video && this.$canvas) {
      (window as any).VD.init(this.$video, this.$canvas);
    }
  }
  public componentWillUnmount() {
    (window as any).VD.deinit();
  }
  public handleStartVideo() {
    (window as any).VD.handleStartVideo();
  }
  public handleSnapPicture() {
    (window as any).VD.handleSnapPicture();
  }
  public handleCloseVideo() {
    (window as any).VD.handleCloseVideo();
  }
  public handleWidthChange(event: any) {
    this.setState({
      width: event.target.value,
      height: this.state.height
    });
  }
  public handleHeightChange(event: any) {
    this.setState({
      height: event.target.value,
      width: this.state.width
    });
  }
  public handleUpdateDimensions() {
    (window as any).VD.handleUpdateDimensions(
      parseInt(this.state.width, 10),
      parseInt(this.state.height, 10)
    );
  }
  public handleResetFilter() {
    (window as any).VD.handleResetFilter();
  }
  // UI can be improved
  public render() {
    const hideVideo = {
      display: 'none'
    };
    return (
      <div>
        <div>
          {controlButton('', IconNames.VIDEO, this.handleStartVideo)}
          {controlButton('', IconNames.CAMERA, this.handleSnapPicture)}
          {controlButton('Remove filter', IconNames.FILTER_REMOVE, this.handleResetFilter)}
          {controlButton('Close webcam', IconNames.STOP, this.handleCloseVideo)}
        </div>
        <div>
          Width:
          <Textarea cols={5} value={this.state.width} onChange={this.handleWidthChange} />
          &nbsp; Height:
          <Textarea cols={5} value={this.state.height} onChange={this.handleHeightChange} />
          &nbsp;
          {controlButton('Update', IconNames.REFRESH, this.handleUpdateDimensions)}
        </div>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <video
            ref={r => (this.$video = r)}
            style={hideVideo}
            autoPlay={true}
            width={(window as any)._WIDTH}
            height={(window as any)._HEIGHT}
          />
          <canvas
            ref={r => (this.$canvas = r)}
            width={(window as any)._WIDTH}
            height={(window as any)._HEIGHT}
          />
        </div>
      </div>
    );
  }
}

export default VideoDisplay;
