import React from 'react';

type AchievementModalCompletionProps = {
  completionText: string;
};

function AchievementModalCompletion(props: AchievementModalCompletionProps) {
  const { completionText } = props;

  return (
    <div className="completiom">
      <p>{completionText}</p>
    </div>
  );
}

export default AchievementModalCompletion;
