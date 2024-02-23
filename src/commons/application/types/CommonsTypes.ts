import { Router } from '@remix-run/router';

export const LOG_OUT = 'LOG_OUT';
export const UPDATE_REACT_ROUTER = 'UPDATE_REACT_ROUTER';

export type RouterState = Router | null;
