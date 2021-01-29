type AchievementViewCompletionProps = {
  awardedExp: number;
  completionText: string;
};

function AchievementViewCompletion(props: AchievementViewCompletionProps) {
  const { awardedExp, completionText } = props;

  return (
    <div className="completion">
      <h1>{`AWARDED ${awardedExp}XP`}</h1>
      <p>{completionText}</p>
    </div>
  );
}

export default AchievementViewCompletion;
