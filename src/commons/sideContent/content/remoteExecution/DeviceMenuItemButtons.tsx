import { Button } from '@blueprintjs/core';

type Props = {
  text?: React.ReactNode;
  handleDelete: React.MouseEventHandler;
  handleEdit: React.MouseEventHandler;
};

function DeviceMenuItemButtons({ text, handleDelete, handleEdit }: Props) {
  return (
    <>
      {text}
      <div className="edit-buttons">
        <Button
          size="small"
          variant="minimal"
          icon="edit"
          onClick={e => {
            e.stopPropagation();
            handleEdit(e);
          }}
        />
        <Button
          size="small"
          variant="minimal"
          intent="danger"
          icon="trash"
          onClick={e => {
            e.stopPropagation();
            handleDelete(e);
          }}
        />
      </div>
    </>
  );
}

export default DeviceMenuItemButtons;
