import { NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { controlButton } from '../../commons';

interface IState {
  width: number;
  height: number;
}

class VideoDisplay extends React.Component<{}, IState> {
  private $video: HTMLElement | null;
  private $canvas: HTMLElement | null;
  constructor(props: any) {
    super(props);
    this.state = {
      width: (window as any)._WIDTH,
      height: (window as any)._HEIGHT
    };
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
  public handleWidthChange(n: number) {
    if (n > 0) {
      this.setState({
        width: n,
        height: this.state.height
      });
      this.handleUpdateDimensions(n, this.state.height);
    }
  }
  public handleHeightChange(m: number) {
    if (m > 0) {
      this.setState({
        width: this.state.width,
        height: m
      });
      this.handleUpdateDimensions(this.state.width, m);
    }
  }
  public handleUpdateDimensions(n: number, m: number) {
    (window as any).VD.handleUpdateDimensions(n, m);
  }
  // UI can be improved
  public render() {
    const hideVideo = {
      display: 'none'
    };
    return (
      <div>
        <div style={{ margin: '0 auto' }}>
          &nbsp;
          <Tooltip content="Stream video">
            {controlButton('', IconNames.VIDEO, this.handleStartVideo)}
          </Tooltip>
          &nbsp;
          <Tooltip content="Snap picture">
            {controlButton('', IconNames.CAMERA, this.handleSnapPicture)}
          </Tooltip>
          &nbsp;
          <Tooltip content="Change width">
            <NumericInput
              leftIcon={IconNames.HORIZONTAL_DISTRIBUTION}
              style={{ width: 80 }}
              value={this.state.width}
              onValueChange={this.handleWidthChange}
            />
          </Tooltip>
          &nbsp;
          <Tooltip content="Change height">
            <NumericInput
              leftIcon={IconNames.VERTICAL_DISTRIBUTION}
              style={{ width: 80 }}
              value={this.state.height}
              onValueChange={this.handleHeightChange}
            />
          </Tooltip>
          &nbsp;
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
