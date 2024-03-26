import { Button, Dialog, Tooltip } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import React, { useState } from 'react';
import { prettifyDate } from 'src/commons/achievement/utils/DateHelper';

type Props = {
  type: string;
  date?: Date;
  changeDate: (date?: Date) => void;
};

const EditableDate: React.FC<Props> = ({ type, date, changeDate }) => {
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  const hoverText = date === undefined ? `No ${type}` : `${prettifyDate(date)}`;

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
        <DatePicker
          onChange={changeDate}
          timePickerProps={{ showArrowButtons: true }}
          value={date}
        />
        <Button onClick={() => changeDate(undefined)} text={`Remove ${type}`} />
      </Dialog>
    </>
  );
};

export default EditableDate;
