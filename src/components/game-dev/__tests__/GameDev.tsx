import { shallow } from 'enzyme';
import * as React from 'react';

import GameDev, { IMaterialProps } from "../GameDev";

test('GameDev page renders correctly', () => {
  const props: IMaterialProps = {
    handleFetchMaterialIndex (p1: number) {
    }, materialDirectoryTree: null, materialIndex: null
  };
  const app = <GameDev {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

