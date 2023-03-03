import { Button, Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

class SideContentToneMatrix extends React.Component<{}, {}> {
  private $container: HTMLElement | null = null;

  public shouldComponentUpdate() {
    return false;
  }

  public componentDidMount() {
    if ((window as any).ToneMatrix) {
      (window as any).ToneMatrix.initialise_matrix(this.$container!);
    }
  }

  public handleClear() {
    (window as any).ToneMatrix.clear_matrix();
  }

  public handleRandomise() {
    (window as any).ToneMatrix.randomise_matrix();
  }

  public render() {
    return (
      <div className="sa-tone-matrix">
        <div className="row">
          <div className={classNames('controls', 'col-xs-12', Classes.DARK, Classes.BUTTON_GROUP)}>
            <Button id="clear-matrix" onClick={this.handleClear}>
              Clear
            </Button>
            <Button id="randomise-matrix" onClick={this.handleRandomise}>
              Randomise
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12" ref={r => (this.$container = r)} />
        </div>
      </div>
    );
  }
}

export default SideContentToneMatrix;
