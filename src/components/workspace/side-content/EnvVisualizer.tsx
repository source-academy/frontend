import * as React from 'react';

class EnvVisualizer extends React.Component<{}, {}> {
  private $parent: HTMLElement | null;

  public componentDidMount() {
    if (this.$parent) {
      (window as any).EnvVisualizer.init(this.$parent);
    }
  }

  public render() {
    return <div ref={r => (this.$parent = r)} className="sa-env-visualizer bp3-dark" />;
  }
}

export default EnvVisualizer;
