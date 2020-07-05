import React from 'react';

type AchievementModalDescriptionProps = {
  description: string;
};

function AchievementModalDescription(props: AchievementModalDescriptionProps) {
  const { description } = props;

  return (
    <div className="modal-desc">
      <p>{description}</p>
    </div>
  );
}

export default AchievementModalDescription;
