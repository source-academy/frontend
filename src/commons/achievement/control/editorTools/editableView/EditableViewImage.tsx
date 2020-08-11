import { Button, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';

type EditableViewImageProps = {
  canvasUrl: string;
  setCanvasUrl: any;
};

function EditableViewImage(props: EditableViewImageProps) {
  const { canvasUrl, setCanvasUrl } = props;

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
          multiline={true}
          onChange={setCanvasUrl}
          value={canvasUrl}
        />
      ) : (
        <img className="view-img" src={canvasUrl} alt={'view image'} />
      )}
    </div>
  );
}

export default EditableViewImage;
