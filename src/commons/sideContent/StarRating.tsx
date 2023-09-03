import { Icon } from '@blueprintjs/core';
import React from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange }) => {
  const maxStars = 5;

  const handleStarClick = (selectedValue: number) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <div className="star-rating">
      {[...Array(maxStars)].map((_, index) => (
        <Icon
          key={index}
          icon={value >= index + 1 ? 'star' : 'star-empty'}
          onClick={() => handleStarClick(index + 1)}
        />
      ))}
    </div>
  );
};

export default StarRating;
