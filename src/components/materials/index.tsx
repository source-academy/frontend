import * as React from 'react';

import { MaterialData } from '../academy/materialsUpload/materialShape';
import MaterialTable from '../academy/materialsUpload/MaterialTable';

interface IMaterialProps extends IDispatchProps, IStateProps {}

export interface IDispatchProps {
  handleFetchMaterialIndex: (id?: number) => void;
}

export interface IStateProps {
  materialIndex: MaterialData[] | null;
}

class Material extends React.Component<IMaterialProps, {}> {
  public render() {
    return (
      <div className="ContentDisplay row center-xs">
        <div className={`${'col-xs-10'} contentdisplay-content-parent`}>
          <MaterialTable
            handleFetchMaterialIndex={this.props.handleFetchMaterialIndex}
            materialIndex={this.props.materialIndex}
          />
        </div>
      </div>
    );
  }
}

export default Material;
