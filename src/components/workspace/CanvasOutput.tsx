import * as React from 'react';

/**
 * Takes the output of the rendered graphics (in a hidden canvas tag under <body>)
 * and makes it into a new <canvas> output for viewing.
 */
class CanvasOutput extends React.Component<{}, {}> {
  private $canvas: HTMLCanvasElement | null;
  private $parent: HTMLElement | null;

  public componentDidMount() {
    const source = document.querySelector('.rune-canvas') as HTMLCanvasElement;
    const context = (window as any).RUNE_CONTEXT || '2d';
    if (context === '2d') {
      const ctx = this.$canvas!.getContext(context);
      ctx!.drawImage(source, 0, 0);
    } else {
      this.$canvas!.hidden = true;
      this.$parent!.appendChild(source);
      source.hidden = false;
    }
  }

  public render() {
    return (
      <div ref={r => (this.$parent = r)} className="canvas-container">
        <canvas width={512} height={512} ref={r => (this.$canvas = r)} />
      </div>
    );
  }
}

export default CanvasOutput;
