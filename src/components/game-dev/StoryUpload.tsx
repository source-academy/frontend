import { Divider } from '@blueprintjs/core';
import * as React from 'react';

import Dropzone from './Dropzone';
import { DirectoryData, MaterialData } from './storyShape';
import StoryTable from './StoryTable';

export interface IStoryProps extends IDispatchProps, IStateProps {}

export interface IDispatchProps {
  handleCreateMaterialFolder: (title: string) => void;
  handleDeleteMaterial: (id: number) => void;
  handleDeleteMaterialFolder: (id: number) => void;
  handleFetchMaterialIndex: (id: number) => void;
  handleFetchTestStories: () => void;
  handleUploadMaterial: (file: File, title: string, description: string) => void;
}

export interface IStateProps {
  materialDirectoryTree: DirectoryData[] | null;
  materialIndex: MaterialData[] | null;
}

class StoryUpload extends React.Component<IStoryProps, {}> {
  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div className={`${'col-xs-10'} contentdisplay-content-parent`}></div>
      </div>
    );
  }
}

export default StoryUpload;
