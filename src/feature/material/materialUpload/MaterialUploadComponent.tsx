import { Divider } from '@blueprintjs/core';
import * as React from 'react';

import Dropzone from './Dropzone';
import { DirectoryData, MaterialData } from '../materialTypes';
import MaterialTable from '../materialTable/MaterialTableComponent';

export interface IMaterialUploadProps extends IMaterialUploadDispatchProps, IMaterialUploadStateProps {}

export interface IMaterialUploadDispatchProps {
  handleCreateMaterialFolder: (title: string) => void;
  handleDeleteMaterial: (id: number) => void;
  handleDeleteMaterialFolder: (id: number) => void;
  handleFetchMaterialIndex: (id?: number) => void;
  handleUploadMaterial: (file: File, title: string, description: string) => void;
}

export interface IMaterialUploadStateProps {
  materialDirectoryTree: DirectoryData[] | null;
  materialIndex: MaterialData[] | null;
}

class MaterialUpload extends React.Component<IMaterialUploadProps, {}> {
  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div className={`${'col-xs-10'} contentdisplay-content-parent`}>
          <Dropzone handleUploadMaterial={this.props.handleUploadMaterial} />
          <Divider />
          <MaterialTable
            handleCreateMaterialFolder={this.props.handleCreateMaterialFolder}
            handleDeleteMaterial={this.props.handleDeleteMaterial}
            handleDeleteMaterialFolder={this.props.handleDeleteMaterialFolder}
            handleFetchMaterialIndex={this.props.handleFetchMaterialIndex}
            materialDirectoryTree={this.props.materialDirectoryTree}
            materialIndex={this.props.materialIndex}
          />
        </div>
      </div>
    );
  }
}

export default MaterialUpload;
