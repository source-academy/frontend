type ObjectTexture = string;
type XCoord = number;
type YCoord = number;
type ObjectDetail = [ObjectTexture, XCoord, YCoord];

type ActionName = string;
type ActionParams = Array<any>;
type ObjectAction = [ActionName, ActionParams];

export type LocationRawObjectsMap = {
  [location: string]: string[];
};

export type ObjectProperty = {
  details: ObjectDetail;
  actions: ObjectAction[];
};

export type ObjectPropertyMap = {
  [objectId: string]: ObjectProperty;
};

export type LocationObjectsMap = {
  [location: string]: ObjectPropertyMap;
};
