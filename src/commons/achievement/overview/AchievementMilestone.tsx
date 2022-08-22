type AchievementMilestoneProps = {
  studentXp: number;
};

// 36k XP = Level 37
function AchievementMilestone(props: AchievementMilestoneProps) {
  const { studentXp } = props;
  const CA_FULlFILLMENT_LEVEL = process.env.REACT_APP_CA_FULFILLMENT_LEVEL;
  return (
    <div className="milestone">
      <h2>ACHIEVEMENT LEVEL</h2>
      <div className="details">
        <div className="level-badge">
          <span className="level-icon" />
          <p>{CA_FULlFILLMENT_LEVEL}</p>
        </div>
        <p className="description">Complete CS1101S CA Component</p>
      </div>
      <div className="details">
        <div className="level-badge">
          <span className="level-icon" />
          <p>{CA_FULlFILLMENT_LEVEL}+</p>
        </div>
        <p className="description">Counts towards CS1010R</p>
      </div>
      <div className="footer">
        <p>Total XP: {studentXp}</p>
        <p>Note: subject to change</p>
      </div>
    </div>
  );
}

export default AchievementMilestone;
