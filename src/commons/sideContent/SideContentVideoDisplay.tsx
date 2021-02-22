import { Button, ButtonGroup, Divider, NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { parseError } from 'js-slang';
import * as React from 'react';

export type SideContentVideoDisplayMode = 'video' | 'still';

type State = {
  width: number;
  height: number;
  FPS: number;
  mode: SideContentVideoDisplayMode;
  needSetup: boolean;
};

type Props = {
  replChange: (code: string) => void;
};

class SideContentVideoDisplay extends React.Component<Props, State> {
  private $video: HTMLElement | null = null;
  private $canvas: HTMLElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      width: (window as any)._WIDTH,
      height: (window as any)._HEIGHT,
      FPS: (window as any)._FPS,
      mode: 'video' as SideContentVideoDisplayMode,
      needSetup: true
    };
  }

  public componentDidMount() {
    this.setupVideoService();
    window.addEventListener('beforeunload', this.closeVideo);
  }

  public componentWillUnmount() {
    this.closeVideo();
    window.removeEventListener('beforeunload', this.closeVideo);
  }

  public setupVideoService = () => {
    const _VD = (window as any)._VD;
    if (this.$video && this.$canvas && _VD) {
      _VD.init(this.$video, this.$canvas, this.printError);
      this.setState({
        width: (window as any)._WIDTH,
        height: (window as any)._HEIGHT,
        FPS: (window as any)._FPS,
        mode: 'video' as SideContentVideoDisplayMode,
        needSetup: false
      });
    }
  };

  public printError = (err: any, isSlangErr: boolean) => {
    if (isSlangErr) {
      this.props.replChange(parseError(err));
    } else {
      this.props.replChange(err);
    }
  };

  public closeVideo = () => {
    (window as any)._VD?.deinit();
  };

  public handleStartVideo = () => {
    (window as any)._VD?.startVideo();
  };

  public handleSnapPicture = () => {
    (window as any)._VD?.snapPicture();
  };

  public handleCloseVideo = () => {
    (window as any)._VD?.stopVideo();
  };

  public handleWidthChange = (n: number) => {
    if (n > 0 && n <= 500) {
      this.setState({
        width: n,
        height: this.state.height
      });
      this.handleUpdateDimensions(n, this.state.height);
    }
  };

  public handleHeightChange = (m: number) => {
    if (m > 0 && m <= 500) {
      this.setState({
        width: this.state.width,
        height: m
      });
      this.handleUpdateDimensions(this.state.width, m);
    }
  };

  public handleFPSChange = (m: number) => {
    //these magic numbers are based off video library
    if (m > 2 && m < 30) {
      this.setState({
        FPS: m
      });
      (window as any)._VD?.updateFPS(m);
    }
  };

  public handleUpdateDimensions = (n: number, m: number) => {
    (window as any)._VD?.updateDimensions(n, m);
  };

  // UI can be improved
  public render() {
    const hideVideo = {
      display: 'none'
    };

    const videoIsActive = this.state.mode === ('video' as SideContentVideoDisplayMode);
    const stillIsActive = this.state.mode === ('still' as SideContentVideoDisplayMode);

    return (
      <div className="sa-video">
        {this.state.needSetup ? (
          <div>
            <p>
              Looks like the video did not have time to load. Click the button below to activate.
            </p>
            <Button
              className={'sa-live-video-button'}
              text={'Start Video'}
              onClick={this.setupVideoService}
            />
            <br />
            <br />
          </div>
        ) : (
          <div></div>
        )}
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
              <Tooltip2 content="Change width">
                <NumericInput
                  leftIcon={IconNames.HORIZONTAL_DISTRIBUTION}
                  style={{ width: 70 }}
                  value={this.state.width}
                  onValueChange={this.handleWidthChange}
                  minorStepSize={1}
                  stepSize={10}
                  majorStepSize={100}
                  max={500}
                />
              </Tooltip2>
            </div>
            <div className="sa-video-header-numeric-input">
              <Tooltip2 content="Change height">
                <NumericInput
                  leftIcon={IconNames.VERTICAL_DISTRIBUTION}
                  style={{ width: 70 }}
                  value={this.state.height}
                  onValueChange={this.handleHeightChange}
                  minorStepSize={1}
                  stepSize={10}
                  majorStepSize={100}
                  max={500}
                />
              </Tooltip2>
            </div>
            <div className="sa-video-header-numeric-input">
              <Tooltip2 content="Change FPS">
                <NumericInput
                  leftIcon={IconNames.STOPWATCH}
                  style={{ width: 60 }}
                  value={this.state.FPS}
                  onValueChange={this.handleFPSChange}
                  minorStepSize={null}
                  stepSize={1}
                  majorStepSize={null}
                  max={30}
                  min={2}
                />
              </Tooltip2>
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

        <br />
        <p style={{ fontFamily: 'courier' }}>
          Note: Is video lagging? Switch to 'still image' or adjust FPS rate!
        </p>
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
