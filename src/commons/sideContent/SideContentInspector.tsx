import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import * as React from 'react';

type State = {
  loading: boolean;
};

class SideContentInspector extends React.Component<{}, State> {
  private $parent: HTMLElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = { loading: true };
  }

  public componentDidMount() {
    this.tryToLoad();
  }

  public render() {
    return (
      <div ref={r => (this.$parent = r)} className="sa-inspector bp3-dark">
        <p id="inspector-default-text" className={Classes.RUNNING_TEXT}>
          The inspector generates a list of variable bindings based on breakpoints set in the
          editor.
          <br />
          <br />
          It is activated by clicking on the gutter of the editor (where all the line numbers are,
          on the left) to set a breakpoint, and then running the program. Only the first line of a
          statement can have a breakpoint. The program halts just before the statement is evaluated.
        </p>
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

export default SideContentInspector;
