function AchievementMilestone() {
  return (
    <div className="milestone">
      <h2>ACHIEVEMENT LEVEL</h2>
      <div className="details">
        <div className="level-badge">
          <span className="level-icon" />
          <p>36</p>
        </div>
        <p className="description">Complete CS1101S CA Component</p>
      </div>
      <div className="details">
        <div className="level-badge">
          <span className="level-icon" />
          <p>40</p>
        </div>
        <p className="description">Earn extra 1 MC from CS1010R</p>
      </div>
      <div className="footer">
        <p>Note: subject to change</p>
      </div>
    </div>
  );
}

export default AchievementMilestone;
