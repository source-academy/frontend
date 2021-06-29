import * as React from 'react';
import Latex from 'react-latex-next';

type SicpLatexProps = {
  math: string;
};

const SicpLatex: React.FC<SicpLatexProps> = props => {
  return <Latex>{props.math}</Latex>;
};

export default SicpLatex;
