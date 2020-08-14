import { Button, Dialog, Tooltip } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import React, { useState } from 'react';
import { prettifyDate } from 'src/commons/achievement/utils/DateHelper';

type EditableDateProps = {
  type: string;
  date?: Date;
  changeDate: any;
};

function EditableDate(props: EditableDateProps) {
  const { type, date, changeDate } = props;

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  const hoverText = date === undefined ? `No ${type}` : `${prettifyDate(date)}`;

  return (
    <>
      <Tooltip content={hoverText}>
        <Button minimal={true} outlined={true} onClick={toggleOpen}>{`${type}`}</Button>
      </Tooltip>
      <Dialog
        title={`Edit ${type}`}
        isCloseButtonShown={false}
        isOpen={isOpen}
        onClose={toggleOpen}
        style={{
          background: '#fff',
          maxWidth: 'max-content',
          padding: '1em'
        }}
      >
        <DatePicker
          timePickerProps={{ showArrowButtons: true }}
          value={date}
          onChange={changeDate}
        />
        <Button text={`Remove ${type}`} onClick={() => changeDate(undefined)} />
      </Dialog>
    </>
  );
}

export default EditableDate;
