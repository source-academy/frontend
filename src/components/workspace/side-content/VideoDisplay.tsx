import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import { controlButton } from '../../commons';

interface IState {
  width: string;
  height: string;
}

class VideoDisplay extends React.Component<{}, IState> {
  private $parent: HTMLElement | null;
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
    if (this.$parent) {
      (window as any).VideoDisplay.init(this.$parent);
    }
  }
  public componentWillUnmount() {
    (window as any).VideoDisplay.deinit();
  }
  public handleStartVideo() {
    (window as any).VideoDisplay.handleStartVideo();
  }
  public handlePauseVideo() {
    (window as any).VideoDisplay.handlePauseVideo();
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
    (window as any).VideoDisplay.handleUpdateDimensions(
      parseInt(this.state.width, 10),
      parseInt(this.state.height, 10)
    );
  }
  public handleResetFilter() {
    (window as any).VideoDisplay.handleResetFilter();
  }
  // UI can be improved
  public render() {
    return (
      <div>
        <div>
          {controlButton('', IconNames.PLAY, this.handleStartVideo)}
          {controlButton('', IconNames.PAUSE, this.handlePauseVideo)}
          {controlButton('Reset filter', IconNames.REFRESH, this.handleResetFilter)}
        </div>
        <div>
          Width:
          <Textarea value={this.state.width} onChange={this.handleWidthChange} />
        </div>
        <div>
          Height:
          <Textarea value={this.state.height} onChange={this.handleHeightChange} />
        </div>
        <div>
          {controlButton('Update video dimensions', IconNames.REFRESH, this.handleUpdateDimensions)}
        </div>
        <div ref={r => (this.$parent = r)} style={{ width: '100%', textAlign: 'center' }} />
      </div>
    );
  }
}

export default VideoDisplay;
