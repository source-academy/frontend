import * as React from 'react';

import { DirectoryData, MaterialData } from '../materialTypes';
import MaterialTable from '../materialTable/MaterialTableComponent';

export interface IMaterialFetchProps extends IMaterialFetchDispatchProps, IMaterialFetchStateProps {}

export interface IMaterialFetchDispatchProps {
  handleFetchMaterialIndex: (id?: number) => void;
}

export interface IMaterialFetchStateProps {
  materialDirectoryTree: DirectoryData[] | null;
  materialIndex: MaterialData[] | null;
}

class MaterialFetch extends React.Component<IMaterialFetchProps, {}> {
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

export default MaterialFetch;
