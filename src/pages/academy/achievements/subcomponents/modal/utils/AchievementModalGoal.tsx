import React from 'react';

type AchievementModalGoalProps = {
  goalText: string;
};

function AchievementModalGoal(props: AchievementModalGoalProps) {
  const { goalText } = props;

  return (
    <div>
      <p>{goalText}</p>
    </div>
  );
}

export default AchievementModalGoal;
