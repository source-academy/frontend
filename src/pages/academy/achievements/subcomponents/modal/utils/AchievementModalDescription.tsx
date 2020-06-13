import React from 'react';

type AchievementModalDescriptionProps = {
  description: string;
};

function AchievementModalDescription(props: AchievementModalDescriptionProps) {
  const { description } = props;

  return (
    <div>
      <h3>{description}</h3>
    </div>
  );
}

export default AchievementModalDescription;
