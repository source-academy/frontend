import { Button } from '@blueprintjs/core';

type Props = {
  onClick: () => void;
  children: React.ReactNode;
};

function RemoveButton({ onClick, children }: Props) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="minimal"
      className="h-8 px-4 rounded text-sm transition-all"
      intent="danger"
    >
      {children}
    </Button>
  );
}

export default RemoveButton;
