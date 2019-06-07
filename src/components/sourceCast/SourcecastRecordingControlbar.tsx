/* tslint:disable:no-console */
import * as React from 'react';

class SourcecastRecordingControlbar extends React.PureComponent<
  ISourcecastRecordingControlbarProps
> {
  constructor(props: ISourcecastRecordingControlbarProps) {
    super(props);
  }

  public render() {
    return (
      <div>
        <h1>SourceCastRecordingControlbar</h1>
      </div>
    );
  }
}

export interface ISourcecastRecordingControlbarProps {
  handleRecordEditorInput: (time: number, data: any[]) => void;
  isRecording: boolean;
  playbackData: any[];
}

export default SourcecastRecordingControlbar;
