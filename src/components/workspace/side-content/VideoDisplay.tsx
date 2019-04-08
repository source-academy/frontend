import * as React from 'react';

class VideoDisplay extends React.Component<{}, {}> {
  private $parent: HTMLElement | null;

  public componentDidMount() {
    if (this.$parent) {
      (window as any).VideoDisplay.init(this.$parent);
    }
  }
  public componentWillUnmount() {
    (window as any).VideoDisplay.deinit();
  }

  public render() {
    // return <div ref={r => (this.$parent = r)} className="sa-video-display pt-dark" />;
    return (
        <>
            <div
                ref={r => (this.$parent = r)}
                id="p5canvas-container"
                style={{ width: "100%", textAlign: "center" }}
            />
        </>
    );
  }
}

export default VideoDisplay;
