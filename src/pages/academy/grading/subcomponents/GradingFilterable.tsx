import React from 'react';
import classes from 'src/styles/Grading.module.scss';

type Props = {
  value: string;
  children?: React.ReactNode;
  filterMode: boolean;
};

const GradingFilterable: React.FC<Props> = ({ value, children, filterMode }) => {
  return (
    <button
      type="button"
      className={
        classes[
          filterMode ? 'grading-overview-filterable-btns' : 'grading-overview-unfilterable-btns'
        ]
      }
      key={value}
    >
      {children || value}
    </button>
  );
};

export default GradingFilterable;
