import React from 'react';
import Latex from 'react-latex-next';

type Props = {
  math: string;
};

const SicpLatex: React.FC<Props> = ({ math }) => {
  return <Latex>{math}</Latex>;
};

export default SicpLatex;
