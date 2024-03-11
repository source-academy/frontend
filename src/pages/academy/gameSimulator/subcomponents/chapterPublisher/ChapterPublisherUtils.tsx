export const dateOneYearFromNow = (date: Date) => {
  date.setFullYear(date.getFullYear() + 1);
  return date;
};
