import { Button, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';

type EditableViewImageProps = {
  canvasUrl: string;
  title: string;
  setcanvasUrl: any;
};

function EditableViewImage(props: EditableViewImageProps) {
  const { canvasUrl, title, setcanvasUrl } = props;

  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <div>
      <Button
        text={isEditing ? 'Save Image URL' : 'Edit Image'}
        onClick={() => setIsEditing(!isEditing)}
      />
      {isEditing ? (
        <EditableText
          placeholder={`Enter your image URL here`}
          value={canvasUrl}
          onChange={setcanvasUrl}
          multiline={true}
        />
      ) : (
        <img className="modal-img" src={canvasUrl} alt={title} />
      )}
    </div>
  );
}

export default EditableViewImage;
