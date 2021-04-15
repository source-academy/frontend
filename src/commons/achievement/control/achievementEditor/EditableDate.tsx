import { Button, Dialog } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import { prettifyDate } from 'src/commons/achievement/utils/DateHelper';

type EditableDateProps = {
  type: string;
  date?: Date;
  changeDate: (date?: Date) => void;
};

function EditableDate(props: EditableDateProps) {
  const { type, date, changeDate } = props;

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  const hoverText = date === undefined ? `No ${type}` : `${prettifyDate(date)}`;

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
        <DatePicker
          onChange={changeDate}
          timePickerProps={{ showArrowButtons: true }}
          value={date}
        />
        <Button onClick={() => changeDate(undefined)} text={`Remove ${type}`} />
      </Dialog>
    </>
  );
}

export default EditableDate;
