import { NonIdealState, Spinner } from '@blueprintjs/core';
import * as React from 'react';
// import { createContext } from '../../../utils/slangHelper';

interface IInspectorState {
  loading: boolean;
}

class Inspector extends React.Component<{}, IInspectorState> {
  private $parent: HTMLElement | null;

  constructor(props: any) {
    super(props);
    this.state = { loading: true };
  }

  public componentDidMount() {
    this.tryToLoad();
  }

  public render() {
    return (
      <div ref={r => (this.$parent = r)} className="sa-inspector">
        {this.state.loading && (
          <NonIdealState description="Loading Inspector..." icon={<Spinner />} />
        )}
      </div>
    );
  }

  private tryToLoad = () => {
    const element = (window as any).Inspector;
    if (this.$parent && element) {
      // Inspector has been loaded into the DOM
      element.init(this.$parent);
      this.setState((state, props) => {
        return { loading: false };
      });
    } else {
      // Try again in 1 second
      window.setTimeout(this.tryToLoad, 1000);
    }
  };
}

export default Inspector;
