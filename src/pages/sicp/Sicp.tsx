import * as React from 'react';
import { SicpChapter } from 'src/features/sicp/SicpTypes';

import SicpDisplay from './subcomponents/SicpDisplay';

export type SicpProps = DispatchProps & StateProps & OwnProps;
export type DispatchProps = {
  handleChangeChapter: (chapter: SicpChapter) => void;
};
export type StateProps = {
  chapter: SicpChapter;
};
export type OwnProps = {};

const Sicp: React.FC<SicpProps> = props => {
  const { chapter } = props;

  const content = "testcontent" + chapter;

  return (
    <SicpDisplay content={content} />
  );
};

export default Sicp;
