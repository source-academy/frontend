import React from 'react';

type AchievementModalCompletionProps = {
  awardedExp: number;
  completionText: string;
};

function AchievementModalCompletion(props: AchievementModalCompletionProps) {
  const { awardedExp, completionText } = props;

  return (
    <div className="completion">
      <h1>{`AWARDED ${awardedExp}XP`}</h1>
      <p>{completionText}</p>
    </div>
  );
}

export default AchievementModalCompletion;
