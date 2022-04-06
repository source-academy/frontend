type AchievementCommentCardProps = {
  comment: string;
};

const AchievementCommentCard = (props: AchievementCommentCardProps) => {
  return <div>{props.comment}</div>;
};

export default AchievementCommentCard;
