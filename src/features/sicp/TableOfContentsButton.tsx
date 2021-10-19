import controlButton from '../../commons/ControlButton';

type TableOfContentsButtonProps = OwnProps;

type OwnProps = {
  key: string;
  handleOpenToc: () => void;
};

export function TableOfContentsButton(props: TableOfContentsButtonProps) {
  return controlButton('Table of Contents', null, props.handleOpenToc);
}
