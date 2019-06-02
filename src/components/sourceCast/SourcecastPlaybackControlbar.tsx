import * as React from 'react';

function SourcecastPlaybackControlbar(props: ISourcecastPlaybackControlbarProps) {
  const onClick = () => props.handleSetSourcecastPlaybackIsPlaying(true);

  return (
    <div>
      <audio controls={true}>
        <source
          src="http://www.amclassical.com/mp3/amclassical_beethoven_fur_elise.mp3"
          type="audio/mpeg"
        />
      </audio>
      <button onClick={onClick}>Click Me!</button>
    </div>
  );
}

export interface ISourcecastPlaybackControlbarProps {
  handleSetSourcecastPlaybackIsPlaying: (isPlaying: boolean) => void;
}

export default SourcecastPlaybackControlbar;
