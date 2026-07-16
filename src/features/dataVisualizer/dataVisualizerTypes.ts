// Source-related types
export type Data = any;
export type Pair = [Data, Data];
export type EmptyList = null;
export type List = [Data, List] | EmptyList;

// Drawing-related types
export type Drawing = React.ReactElement;
export type Step = Drawing[];
