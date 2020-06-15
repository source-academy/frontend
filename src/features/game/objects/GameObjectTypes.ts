type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type ObjectProperty = {
  assetKey: string;
  x: number;
  y: number;
  actions?: string[];
  visibility?: true;
  isInteractable: boolean;
};

export type ObjectLayerProps = {
  cursor?: string;
};
