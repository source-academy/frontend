import { Button, Dialog, Tooltip } from '@blueprintjs/core';
import { TimePicker } from '@blueprintjs/datetime';
import React, { useState } from 'react';
import { prettifyTime } from 'src/commons/achievement/utils/DateHelper';

type Props = {
  type: string;
  time?: Date;
  changeTime: (time?: Date) => void;
};

const EditableTime: React.FC<Props> = ({ type, time, changeTime }) => {
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  const hoverText = time === undefined ? `No ${type}` : `${prettifyTime(time)}`;

  return (
    <>
      <Tooltip content={hoverText}>
        <Button minimal={true} onClick={toggleOpen} outlined={true}>{`${type}`}</Button>
      </Tooltip>
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
};

export default EditableTime;
