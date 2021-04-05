export type Data = any;
export type Pair = [Data, Data];
export type EmptyList = null;
export type List = [Data, List] | EmptyList;
export type Drawing = JSX.Element;
export type Step = Drawing[];