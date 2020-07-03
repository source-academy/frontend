import * as React from 'react';

import { DirectoryData, MaterialData } from './materialShape';
import MaterialTable from './MaterialTable';

export interface IMaterialProps extends IDispatchProps, IStateProps {}

export interface IDispatchProps {
  handleFetchMaterialIndex: (id?: number) => void;
}

export interface IStateProps {
  materialDirectoryTree: DirectoryData[] | null;
  materialIndex: MaterialData[] | null;
}

class Material extends React.Component<IMaterialProps, {}> {
  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div className={`${'col-xs-10'} contentdisplay-content-parent`}>
          <MaterialTable
            handleFetchMaterialIndex={this.props.handleFetchMaterialIndex}
            materialDirectoryTree={this.props.materialDirectoryTree}
            materialIndex={this.props.materialIndex}
          />
        </div>
      </div>
    );
  }
}

export default Material;
