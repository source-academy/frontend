import classes from '../Grading.module.css';

type Props = {
  value: string;
  children?: React.ReactNode;
  filterMode: boolean;
};

function GradingFilterable({ value, children, filterMode }: Props) {
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
}

export default GradingFilterable;
