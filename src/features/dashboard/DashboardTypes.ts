export type DashboardState = {
  gradingSummary: GradingSummary;
};

/**
 * As we are dynamically rendering the ag-grid table based on the number of assessment types in
 * the course, we cannot properly type the fields in GradingSummary.
 *
 * In short, cols contains the keys to each object in rows, and corresponds to the display order of ag-grid columns.
 */
export type GradingSummary = {
  cols: string[];
  rows: object[];
};
