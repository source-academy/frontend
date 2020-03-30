import { shallow } from 'enzyme';
import * as React from 'react';

import StoryTable, { IOwnProps } from "../StoryTable";

const componentDidMountSpy = jest.fn();

jest.spyOn(StoryTable.prototype, 'componentDidMount').mockImplementation(componentDidMountSpy);

test('Story table renders correctly', () => {
  const props: IOwnProps = {
    handleCreateMaterialFolder (p1: string) {
    }, handleDeleteMaterial (p1: number) {
    }, handleDeleteMaterialFolder (p1: number) {
    }, handleFetchMaterialIndex (p1: number) {
    }, materialDirectoryTree: null, materialIndex: null
  };
  const app = <StoryTable {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(componentDidMountSpy).toHaveBeenCalled();
});
