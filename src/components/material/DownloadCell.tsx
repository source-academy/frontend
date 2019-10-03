import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { MaterialData } from './materialShape';

interface ISelectCellProps {
  data: MaterialData;
  handleFetchMaterialIndex: (id?: number) => void;
}

class DownloadCell extends React.Component<ISelectCellProps, {}> {
  public constructor(props: ISelectCellProps) {
    super(props);
  }

  public render() {
    return (
      <div>
        {this.props.data.url
          ? controlButton(`${this.props.data.title}`, null, this.handleDownload)
          : controlButton(`${this.props.data.title}`, IconNames.FOLDER_CLOSE, this.handleSelect)}
      </div>
    );
  }

  private handleDownload = () => {
    const url = this.props.data.url;
    const click = document.createEvent('Event');
    click.initEvent('click', true, true);
    const link = document.createElement('A') as HTMLAnchorElement;
    link.href = url;
    link.dispatchEvent(click);
    link.click();
    return link;
  };

  private handleSelect = () => {
    this.props.handleFetchMaterialIndex(this.props.data.id);
  };
}

export default DownloadCell;
