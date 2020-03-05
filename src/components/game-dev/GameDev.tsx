import * as React from 'react';

import { DirectoryData, MaterialData } from './storyShape';
import StoryTable from './StoryTable';

interface IMaterialProps extends IDispatchProps, IStateProps {}

export interface IDispatchProps {
  handleFetchMaterialIndex: (id?: number) => void;
}

export interface IStateProps {
  materialDirectoryTree: DirectoryData[] | null;
  materialIndex: MaterialData[] | null;
}

class GameDev extends React.Component<IMaterialProps, {}> {
  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div className={`${'col-xs-10'} contentdisplay-content-parent`}>
          <StoryTable
            handleFetchMaterialIndex={this.props.handleFetchMaterialIndex}
            materialDirectoryTree={this.props.materialDirectoryTree}
            materialIndex={this.props.materialIndex}
          />
        </div>
      </div>
    );
  }
}

export default GameDev;
