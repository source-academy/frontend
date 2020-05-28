import * as React from 'react';

type CanvasOutputProps = StateProps;

type StateProps = {
  canvas: HTMLCanvasElement;
};

/**
 * Takes the output of the rendered graphics (in a hidden canvas tag under <body>)
 * and makes it into a new <canvas> output for viewing.
 */
class CanvasOutput extends React.Component<CanvasOutputProps, {}> {
  private $parent: HTMLElement | null;

  public componentDidMount() {
    this.$parent!.appendChild(this.props.canvas);
    this.props.canvas.hidden = false;
  }

  public render() {
    return <div ref={r => (this.$parent = r)} className="canvas-container" />;
  }
}

export default CanvasOutput;
