import React from 'react';
import { Line } from 'react-es6-progressbar.js';

type AchievementLevelProps = {
  studentExp: number;
};

function AchievementLevel(props: AchievementLevelProps) {
  const { studentExp } = props;

  const expPerLevel = 1000;
  const level = Math.floor(studentExp / expPerLevel);
  const progress = studentExp % expPerLevel;
  const progressFrac = progress / expPerLevel;
  const barText = progress + '/' + expPerLevel + 'XP';

  const line_options = {
    color: 'yellow',
    easing: 'easeOut',
    strokeWidth: '5',
    trailColor: '#f4f4f4',
    text: {
      // Initial value for text.
      // Default: null
      value: barText,
      style: {
        // Text color.
        // Default: same as stroke color (options.color)
        color: 'black',
        position: 'absolute',
        left: '50%',
        top: '50%',
        padding: 0,
        margin: 0,
        // You can specify styles which will be browser prefixed
        transform: {
          prefix: true,
          value: 'translate(-50%, -50%)'
        }
      }
    }
  };

  return (
    <>
      <h3>{level}</h3>
      <Line progress={progressFrac} options={line_options} container_style={{ display: 'flex' }} />
    </>
  );
}

export default AchievementLevel;
