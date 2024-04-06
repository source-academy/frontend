type FilterableProps = {
  value: string;
  children?: React.ReactNode;
  filterMode: boolean;
};

const GradingFilterable: React.FC<FilterableProps> = ({ value, children, filterMode }) => {
  return (
    <button
      type="button"
      className={
        filterMode ? 'grading-overview-filterable-btns' : 'grading-overview-unfilterable-btns'
      }
    >
      {children || value}
    </button>
  );
};

export default GradingFilterable;
