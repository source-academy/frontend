import { Divider } from '@blueprintjs/core';
import * as React from 'react';

import Dropzone from './Dropzone';
import { MaterialData } from './materialShape';
import MaterialTable from './MaterialTable';

interface IMaterialProps extends IDispatchProps, IStateProps {}

export interface IDispatchProps {
  handleCreateMaterialFolder: (name: string) => void;
  handleDeleteMaterial: (id: number) => void;
  handleFetchMaterialIndex: () => void;
  handleUploadMaterial: (file: File, title: string, description: string) => void;
}

export interface IStateProps {
  materialIndex: MaterialData[] | null;
}

class Material extends React.Component<IMaterialProps, {}> {
  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div className={`${'col-xs-10'} contentdisplay-content-parent`}>
          <Dropzone handleUploadMaterial={this.props.handleUploadMaterial} />
          <Divider />
          <MaterialTable
            handleCreateMaterialFolder={this.props.handleCreateMaterialFolder}
            handleDeleteMaterial={this.props.handleDeleteMaterial}
            handleFetchMaterialIndex={this.props.handleFetchMaterialIndex}
            materialIndex={this.props.materialIndex}
          />
        </div>
      </div>
    );
  }
}

export default Material;
