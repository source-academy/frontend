import { MathJax } from 'better-react-mathjax';
import * as React from 'react';

type SicpLatexProps = {
  math: string;
  inline: boolean;
};

const SicpLatex: React.FC<SicpLatexProps> = props => {
  const { math, inline } = props;

  return (
    <MathJax inline={inline} dynamic={false}>
      {math}
    </MathJax>
  );
};

export default SicpLatex;
