import { Button, ButtonGroup, Divider, NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { showWarningMessage } from '../../commons/utils/NotificationsHelper';

export type SideContentVideoDisplayMode = 'video' | 'still';

type State = {
  width: number;
  height: number;
  mode: SideContentVideoDisplayMode;
};

class SideContentVideoDisplay extends React.Component<{}, State> {
  private $video: HTMLElement | null = null;
  private $canvas: HTMLElement | null = null;
  constructor(props: any) {
    super(props);
    this.state = {
      width: (window as any)._WIDTH,
      height: (window as any)._HEIGHT,
      mode: 'video' as SideContentVideoDisplayMode
    };
    this.handleWidthChange = this.handleWidthChange.bind(this);
    this.handleHeightChange = this.handleHeightChange.bind(this);
  }
  public componentDidMount() {
    const _VD = (window as any)._VD;
    if (this.$video && this.$canvas && _VD) {
      _VD.init(this.$video, this.$canvas, this.handleError);
    }
  }
  public componentWillUnmount() {
    (window as any)._VD?.deinit();
  }
  public handleStartVideo() {
    (window as any)._VD?.startVideo();
  }
  public handleSnapPicture() {
    (window as any)._VD?.snapPicture();
  }
  public handleCloseVideo() {
    (window as any)._VD?.stopVideo();
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
    (window as any)._VD?.updateDimensions(n, m);
  }
  public handleError(_e: Error) {
    showWarningMessage("There was an error with the applied filter", 1000);
  }
  // UI can be improved
  public render() {
    const hideVideo = {
      display: 'none'
    };

    const videoIsActive = this.state.mode === ('video' as SideContentVideoDisplayMode);
    const stillIsActive = this.state.mode === ('still' as SideContentVideoDisplayMode);

    return (
      <div className="sa-video">
        <div className="sa-video-header">
          <div className="sa-video-header-element">
            <ButtonGroup>
              <Button
                className={'sa-live-video-button'}
                icon={IconNames.VIDEO}
                active={videoIsActive}
                onClick={this.swapModes(this.state.mode)}
                text={'Live Video'}
              />
              <Button
                className={'sa-still-image-button'}
                icon={IconNames.CAMERA}
                active={stillIsActive}
                onClick={stillIsActive ? this.handleSnapPicture : this.swapModes(this.state.mode)}
                text={'Still Image'}
              />
            </ButtonGroup>
          </div>
          <Divider />
          <div className="sa-video-header-element">
            <div className="sa-video-header-numeric-input">
              <Tooltip content="Change width">
                <NumericInput
                  leftIcon={IconNames.HORIZONTAL_DISTRIBUTION}
                  style={{ width: 70 }}
                  value={this.state.width}
                  onValueChange={this.handleWidthChange}
                  minorStepSize={1}
                  stepSize={10}
                  majorStepSize={100}
                />
              </Tooltip>
            </div>
            <div className="sa-video-header-numeric-input">
              <Tooltip content="Change height">
                <NumericInput
                  leftIcon={IconNames.VERTICAL_DISTRIBUTION}
                  style={{ width: 70 }}
                  value={this.state.height}
                  onValueChange={this.handleHeightChange}
                  minorStepSize={1}
                  stepSize={10}
                  majorStepSize={100}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="sa-video-element">
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

  private swapModes = (mode: SideContentVideoDisplayMode) => () => {
    switch (mode) {
      case 'video':
        this.setState((state: State) => {
          return { ...state, mode: 'still' as SideContentVideoDisplayMode };
        }, this.handleSnapPicture);
        break;

      case 'still':
        this.setState((state: State) => {
          return { ...state, mode: 'video' as SideContentVideoDisplayMode };
        }, this.handleStartVideo);
        break;
    }
  };
}

export default SideContentVideoDisplay;
