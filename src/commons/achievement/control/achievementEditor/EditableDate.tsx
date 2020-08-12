import { Button, Dialog } from '@blueprintjs/core';
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

  const buttonText = date === undefined ? `Set ${type}` : `${type}: ${prettifyDate(date)}`;

  return (
    <div className="deadline">
      <Button onClick={toggleOpen}>{buttonText}</Button>
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
    </div>
  );
}

export default EditableDate;
