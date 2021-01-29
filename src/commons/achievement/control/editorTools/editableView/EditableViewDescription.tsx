import { EditableText } from '@blueprintjs/core';

type EditableViewDescriptionProps = {
  description: string;
  setDescription: any;
};

function EditableViewDescription(props: EditableViewDescriptionProps) {
  const { description, setDescription } = props;

  return (
    <>
      <h3>
        <EditableText
          placeholder={`Enter your description here`}
          value={description}
          onChange={setDescription}
          multiline={true}
        />
      </h3>
    </>
  );
}

export default EditableViewDescription;
