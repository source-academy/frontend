import { Button, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';

type EditableViewImageProps = {
  canvasUrl: string;
  title: string;
  setCanvasUrl: any;
};

function EditableViewImage(props: EditableViewImageProps) {
  const { canvasUrl, title, setCanvasUrl } = props;

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
          onChange={setCanvasUrl}
          multiline={true}
        />
      ) : (
        <img className="view-img" src={canvasUrl} alt={title} />
      )}
    </div>
  );
}

export default EditableViewImage;
