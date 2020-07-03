import { shallow } from 'enzyme';
import * as React from 'react';

import MaterialTable, { IOwnProps } from '../MaterialTable';

const componentDidMountSpy = jest.fn();

jest.spyOn(MaterialTable.prototype, 'componentDidMount').mockImplementation(componentDidMountSpy);

test('Material table renders correctly', () => {
  const props: IOwnProps = {
    handleCreateMaterialFolder(p1: string) {},
    handleDeleteMaterial(p1: number) {},
    handleDeleteMaterialFolder(p1: number) {},
    handleFetchMaterialIndex(p1: number) {},
    materialDirectoryTree: null,
    materialIndex: null
  };
  const app = <MaterialTable {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(componentDidMountSpy).toHaveBeenCalled();
});
