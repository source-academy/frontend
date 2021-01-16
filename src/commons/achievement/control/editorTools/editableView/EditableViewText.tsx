import { EditableText } from '@blueprintjs/core';

type EditableViewTextProps = {
  goalText: string;
  setGoalText: any;
};

function EditableViewText(props: EditableViewTextProps) {
  const { goalText, setGoalText } = props;

  return (
    <>
      <EditableText
        placeholder={`Enter your goal text here`}
        value={goalText}
        onChange={setGoalText}
        multiline={true}
      />
    </>
  );
}

export default EditableViewText;
