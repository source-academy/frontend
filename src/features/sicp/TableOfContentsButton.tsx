import ControlButton from '../../commons/ControlButton';

type TableOfContentsButtonProps = {
  handleOpenToc: () => void;
};

export function TableOfContentsButton({ handleOpenToc }: TableOfContentsButtonProps) {
  return <ControlButton label="Table of Contents" onClick={handleOpenToc} />;
}
