import { Button, Dialog } from '@blueprintjs/core';
import { TimePicker } from '@blueprintjs/datetime';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import { prettifyTime } from 'src/commons/achievement/utils/DateHelper';

type EditableTimeProps = {
  type: string;
  time?: Date;
  changeTime: (time?: Date) => void;
};

function EditableTime(props: EditableTimeProps) {
  const { type, time, changeTime } = props;

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  const hoverText = time === undefined ? `No ${type}` : `${prettifyTime(time)}`;

  return (
    <>
      <Tooltip2 content={hoverText}>
        <Button minimal={true} onClick={toggleOpen} outlined={true}>{`${type}`}</Button>
      </Tooltip2>
      <Dialog
        isCloseButtonShown={false}
        isOpen={isOpen}
        onClose={toggleOpen}
        style={{
          background: '#fff',
          maxWidth: 'max-content',
          padding: '0.25em',
          textAlign: 'center'
        }}
        title={`${type}`}
      >
        <TimePicker onChange={changeTime} showArrowButtons={true} value={time} />
        <Button onClick={() => changeTime(undefined)} text={`Remove ${type}`} />
      </Dialog>
    </>
  );
}

export default EditableTime;
