import Latex from 'react-latex-next';

type Props = {
  math: string;
};

function SicpLatex({ math }: Props) {
  return <Latex>{math}</Latex>;
}

export default SicpLatex;
