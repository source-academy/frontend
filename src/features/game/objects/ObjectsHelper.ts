import { matchExact } from '../parser/StringUtils';
export const isLabel = (line: string) => matchExact(/\[.+\]/, line);
