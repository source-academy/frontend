import * as dotenv from 'dotenv';

dotenv.config();

export const LUMINUS_CLIENT_ID = process.env.REACT_APP_LUMINUS_CLIENT_ID;
export const VERSION = process.env.REACT_APP_VERSION;
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const USE_BACKEND =
  process.env.REACT_APP_USE_BACKEND !== undefined &&
  process.env.REACT_APP_USE_BACKEND !== '' &&
  process.env.REACT_APP_USE_BACKEND!.toUpperCase() === 'TRUE';
export const USE_CHATKIT =
  process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR !== undefined &&
  process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR !== '';
export const INSTANCE_LOCATOR = process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR;

export enum LINKS {
  GITHUB_ISSUES = 'https://github.com/source-academy/cadet-frontend/issues',
  GITHUB_ORG = 'https://github.com/source-academy',

  MODULE_DETAILS = 'https://www.comp.nus.edu.sg/~cs1101s',
  LUMINUS = 'https://luminus.nus.edu.sg/modules/57290e55-335a-4c09-b904-a795572d6cda',
  PIAZZA = 'https://piazza.com/nus.edu.sg/fall2019/cs1101s',
  SHAREDB_SERVER = 'api2.sourceacademy.nus.edu.sg/',
  SOURCE_DOCS = 'https://sicp.comp.nus.edu.sg/source/',
  TECH_SVC = 'mailto:techsvc@comp.nus.edu.sg',
  TEXTBOOK = 'https://sicp.comp.nus.edu.sg/'
}
