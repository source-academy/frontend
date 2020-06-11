type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type ObjectProperty = {
  texture: string;
  x: number;
  y: number;
  actions?: string[];
  visibility?: true;
};
