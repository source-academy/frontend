import * as React from 'react';

type SideContentCanvasOutputProps = StateProps;

type StateProps = {
  canvas: HTMLCanvasElement;
};

/**
 * Takes the output of the rendered graphics (in a hidden canvas tag under <body>)
 * and makes it into a new <canvas> output for viewing.
 */
class SideContentCanvasOutput extends React.Component<SideContentCanvasOutputProps, {}> {
  private $parent: HTMLElement | null = null;

  public componentDidMount() {
    this.$parent!.appendChild(this.props.canvas);
    this.props.canvas.hidden = false;
  }

  public render() {
    return <div ref={r => (this.$parent = r)} className="canvas-container" />;
  }
}

export default SideContentCanvasOutput;
