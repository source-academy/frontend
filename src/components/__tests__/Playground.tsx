import * as React from 'react'

import { shallow } from 'enzyme'

import Playground from '../Playground'
import { IPlaygroundProps as PlaygroundProps } from '../Playground';

test('Playground renders correctly', () => {
  const props: PlaygroundProps = {
    editorValue: 'Hello the world',
    updateCode: (newCode : string ) => { return;}
  }
  const app = <Playground {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
