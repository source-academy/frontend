import React from 'react';
import renderer from 'react-test-renderer';
import { createRenderer } from 'react-test-renderer/shallow';

export const shallowRender = (element: React.ReactElement) => {
  const renderer = createRenderer();
  renderer.render(element);
  return renderer.getRenderOutput();
};

export const renderTreeJson = (element: React.ReactElement) => {
  return renderer.create(element).toJSON();
};

export const renderTree = (element: React.ReactElement) => {
  return renderer.create(element);
};
