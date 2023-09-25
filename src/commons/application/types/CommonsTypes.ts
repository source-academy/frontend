import { Router } from '@remix-run/router';

export const LOG_OUT = 'LOG_OUT';
export const UPDATE_REACT_ROUTER = 'UPDATE_REACT_ROUTER';
export const CHANGE_MODULE_BACKEND = 'CHANGE_MODULE_BACKEND';

export type RouterState = Router | null;
