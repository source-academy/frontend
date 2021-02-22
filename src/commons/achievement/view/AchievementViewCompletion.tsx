type AchievementViewCompletionProps = {
  awardedXp: number;
  completionText: string;
};

function AchievementViewCompletion(props: AchievementViewCompletionProps) {
  const { awardedXp, completionText } = props;

  return (
    <div className="completion">
      <h1>{`AWARDED ${awardedXp}XP`}</h1>
      <p>{completionText}</p>
    </div>
  );
}

export default AchievementViewCompletion;
