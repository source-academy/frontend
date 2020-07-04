export const loggableStyle = {
  fontFamily: 'Helvetica',
  fontSize: '20px',
  fill: '#abd4c6'
};

export interface IScreenLoggable {
  x: number;
  y: number;
}

export interface ICheckpointLoggable {
  checkpointTitle: string;
  checkpointTxtLog: () => string[];
}
