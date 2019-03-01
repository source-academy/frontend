import * as React from 'react';

class ListVisualizer extends React.Component<{}, {}> {
  private $parent: HTMLElement | null;

  public componentDidMount() {
    if (this.$parent) {
      (window as any).ListVisualizer.init(this.$parent);
    }
  }

  public render() {
    return <div ref={r => (this.$parent = r)} className="sa-list-visualizer pt-dark" />;
  }
}

export default ListVisualizer;
