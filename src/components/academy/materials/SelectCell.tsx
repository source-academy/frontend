import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../../commons';

interface ISelectCellProps {
  data: any;
}

class SelectCell extends React.Component<ISelectCellProps, {}> {
  public constructor(props: ISelectCellProps) {
    super(props);
  }

  public render() {
    return <div>{controlButton('', IconNames.TICK, this.handleSelect)}</div>;
  }

  private handleSelect = () => {};
}

export default SelectCell;
