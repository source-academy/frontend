import * as React from 'react';
import ContentDisplay from 'src/commons/ContentDisplay';
import { parseJson } from 'src/features/sicp/parser/ParseJson';

type SicpDisplayProps = OwnProps;
type OwnProps = {
  content: any;
};

const SicpDisplay: React.FC<SicpDisplayProps> = props => {
  const { content } = props;

  const sicpDisplayProps = {
    fullWidth: false,
    display: parseJson(content),
    loadContentDispatch: () => {}
  };

  return <ContentDisplay {...sicpDisplayProps} />;
};

export default SicpDisplay;
