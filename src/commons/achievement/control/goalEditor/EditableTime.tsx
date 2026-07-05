import { Button, Dialog, Tooltip } from '@blueprintjs/core';
import { useState } from 'react';
import { prettifyTime } from 'src/commons/achievement/utils/DateHelper';
import { TimePicker } from 'src/commons/DateTimePickers';

type Props = {
  type: string;
  time?: Date;
  changeTime: (time?: Date) => void;
};

function EditableTime({ type, time, changeTime }: Props) {
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  const hoverText = time === undefined ? `No ${type}` : `${prettifyTime(time)}`;

  return (
    <>
      <Tooltip content={hoverText}>
        <Button variant="outlined" onClick={toggleOpen}>{`${type}`}</Button>
      </Tooltip>
      <Dialog
        isCloseButtonShown={false}
        isOpen={isOpen}
        onClose={toggleOpen}
        style={{
          background: '#fff',
          maxWidth: 'max-content',
          padding: '0.25em',
          textAlign: 'center',
        }}
        title={`${type}`}
      >
        <TimePicker onChange={changeTime} showArrowButtons value={time} />
        <Button onClick={() => changeTime(undefined)} text={`Remove ${type}`} />
      </Dialog>
    </>
  );
}

export default EditableTime;
