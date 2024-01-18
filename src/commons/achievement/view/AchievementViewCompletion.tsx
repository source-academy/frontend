import React from 'react';

type AchievementViewCompletionProps = {
  awardedXp: number;
  completionText: string;
};

const AchievementViewCompletion: React.FC<AchievementViewCompletionProps> = props => {
  const { awardedXp, completionText } = props;

  const paragraphs = completionText ? completionText.split('\n') : [''];

  return (
    <div className="completion">
      {awardedXp > 0 && <h1>{`AWARDED ${awardedXp}XP`}</h1>}
      {paragraphs.map((para, idx) => (
        <p key={idx}>
          {para}
          <br />
        </p>
      ))}
    </div>
  );
};

export default AchievementViewCompletion;
