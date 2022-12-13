import { Button, Divider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

const SideContentFaceapiDisplay: React.FC = () => {
  const browserWindow = window as any;

  const takePhotoA = () => browserWindow.video.takePhotoA();
  const takePhotoB = () => browserWindow.video.takePhotoB();
  const takePhotoC = () => browserWindow.video.takePhotoC();
  const resetPhotoA = () => browserWindow.resetPhotoA();
  const resetPhotoB = () => browserWindow.resetPhotoB();
  const resetPhotoC = () => browserWindow.resetPhotoC();

  // TODO: UI can be improved
  return (
    <div className="sa-video">
      <div className="sa-video-element">
        <video
          id="video"
          style={{ position: 'absolute' }}
          autoPlay={true}
          width={333}
          height={250}
        />

        <canvas
          id="canvas"
          style={{ position: 'relative', top: 0, left: 0 }}
          width={333}
          height={250}
        />
      </div>

      <Divider />

      <div className="sa-video-header">
        <div className="sa-video-header-element">
          <Button
            className={'sa-live-video-button'}
            style={{ height: 20 }}
            icon={IconNames.CAMERA}
            onClick={takePhotoA}
            text={'Take picture'}
          />
        </div>
        <Divider />
        <div className="sa-video-header-element">
          <canvas id="canvas-capture-a" style={{ height: 30 }} />
        </div>
        <Divider />
        <div className="sa-video-header-element">
          <Button
            className={'sa-still-image-button'}
            style={{ height: 20 }}
            icon={IconNames.RESET}
            onClick={resetPhotoA}
            text={'Reset'}
          />
        </div>
      </div>

      <div className="sa-video-header">
        <div className="sa-video-header-element">
          <Button
            className={'sa-live-video-button'}
            style={{ height: 20 }}
            icon={IconNames.CAMERA}
            onClick={takePhotoB}
            text={'Take picture'}
          />
        </div>
        <Divider />
        <div className="sa-video-header-element">
          <canvas id="canvas-capture-b" style={{ height: 20 }} />
        </div>
        <Divider />
        <div className="sa-video-header-element">
          <Button
            className={'sa-still-image-button'}
            style={{ height: 20 }}
            icon={IconNames.RESET}
            onClick={resetPhotoB}
            text={'Reset'}
          />
        </div>
      </div>

      <div className="sa-video-header">
        <div className="sa-video-header-element">
          <Button
            className={'sa-live-video-button'}
            style={{ height: 20 }}
            icon={IconNames.CAMERA}
            onClick={takePhotoC}
            text={'Take picture'}
          />
        </div>
        <Divider />
        <div className="sa-video-header-element">
          <canvas id="canvas-capture-c" style={{ height: 20 }} />
        </div>
        <Divider />
        <div className="sa-video-header-element">
          <Button
            className={'sa-still-image-button'}
            style={{ height: 20 }}
            icon={IconNames.RESET}
            onClick={resetPhotoC}
            text={'Reset'}
          />
        </div>
      </div>
    </div>
  );
};

export default SideContentFaceapiDisplay;
