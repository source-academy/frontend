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

  const makeVideoContainer = (
    takePhoto: () => any,
    resetPhoto: () => any,
    canvasId: string,
    canvasHeight: number
  ) => (
    <div className="sa-video-header">
      <div className="sa-video-header-element">
        <Button
          className="sa-live-video-button"
          style={{ height: 20 }}
          icon={IconNames.CAMERA}
          onClick={takePhoto}
          text={'Take picture'}
        />
      </div>
      <Divider />
      <div className="sa-video-header-element">
        <canvas id={canvasId} style={{ height: canvasHeight }} />
      </div>
      <Divider />
      <div className="sa-video-header-element">
        <Button
          className="sa-still-image-button"
          style={{ height: 20 }}
          icon={IconNames.RESET}
          onClick={resetPhoto}
          text={'Reset'}
        />
      </div>
    </div>
  );

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
      {makeVideoContainer(takePhotoA, resetPhotoA, 'canvas-capture-a', 30)}
      {makeVideoContainer(takePhotoB, resetPhotoB, 'canvas-capture-b', 20)}
      {makeVideoContainer(takePhotoC, resetPhotoC, 'canvas-capture-c', 20)}
    </div>
  );
};

export default SideContentFaceapiDisplay;
