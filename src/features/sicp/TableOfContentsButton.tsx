import ControlButton from '../../commons/ControlButton';

type TableOfContentsButtonProps = OwnProps;

type OwnProps = {
  key: string;
  handleOpenToc: () => void;
};

export function TableOfContentsButton(props: TableOfContentsButtonProps) {
  return <ControlButton label="Table of Contents" onClick={props.handleOpenToc} />;
}
